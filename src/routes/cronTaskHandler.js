import newsClassificationPrompt from '../prompts/newsClassification.txt?raw';

export async function handleScheduledClassTask(event, env, ctx) {
  try {
    const statementBox = env.DB.prepare('SELECT feed_id, title FROM tophub WHERE category IS NULL ORDER BY inserted_at DESC LIMIT 10');
    const { results } = await statementBox.all();
    if (!results || results.length === 0) {
      console.log('[Cron Task] No items to categorize.');
      return;
    }

    const userContent = results.map((item) => ({
      feed_id: item.feed_id,
      title: item.title,
    }));

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.SILI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen3-14B',
        stream: false,
        max_tokens: 512,
        messages: [
          {
            role: 'system',
            content: newsClassificationPrompt
          },
          {
            role: 'user',
            content: JSON.stringify(userContent)
          }
        ]
      })
    };

    const response = await fetch(env.SILI_CHART_URL, options);
    if (!response.ok) {
      throw new Error(`AI service request failed with status ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch || !jsonMatch[1]) {
      throw new Error('Failed to extract JSON from AI response');
    }
    const parsedData = JSON.parse(jsonMatch[1]);

    const statements = [];
    for (const item of parsedData) {
      if (item.feed_id && item.category) {
        const statement = env.DB.prepare(
          'UPDATE tophub SET category = ? WHERE feed_id = ?'
        ).bind(item.category, item.feed_id);
        statements.push(statement);
      } else {
        console.warn(`Skipping invalid update item: ${JSON.stringify(item)}`);
      }
    }
        // 批量执行所有插入操作
    // c.executionCtx.waitUntil 用于确保异步 D1 操作在 Worker 终止前完成
    ctx.waitUntil(
      env.DB.batch(statements)
        .then((results) => {
          console.log(`[D1 Batch Insert] 成功执行 ${results.length} 条语句。`);
        })
        .catch((error) => {
          console.error('[D1 Batch Insert] 更新失败:', error);
        })
    );
  } catch (error) {
    console.error('[Cron Task] 定时任务执行中发生错误:', error);
  }
}