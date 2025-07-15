// src/cronHandler.ts
import { Env } from '../db'; // 导入环境变量接口

export async function handleScheduledClassTask(
  event: ScheduledController,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  try {
    const statementBox = env.DB.prepare('SELECT feed_id, title FROM tophub WHERE category IS NULL ORDER BY inserted_at DESC LIMIT 10');
    const { results } = await statementBox.all<{ feed_id: string; title: string }>();
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
            content: `
你是一个专业的**新闻分类AI**。你的任务是根据给定的**包含feed_id和标题的列表**，准确地判断每条新闻所属的**分类**，并在原始字典中添加分类信息，按照指定的格式输出。

**指令：**
1.  仔细阅读提供的每个文章标题。
2.  根据标题的语义内容，推断其最可能的新闻分类。
3.  如果一个标题可能属于多个分类，请选择最主要或最具体的分类。
4.  如果信息量不足以进行有效分类，请将分类标记为“其他”。
5.  你的输出必须是一个JSON格式的列表，其中每个元素是原始字典（包含\`feed_id\`和\`title\`），并添加了一个\`category\`键值对。

**可供选择的分类：**
*   政治
*   经济
*   社会
*   科技
*   体育
*   娱乐
*   国际
*   军事
*   教育
*   文化
*   健康
*   环境
*   法律
*   汽车
*   房产
*   旅游
*   美食
*   时尚
*   其他

**输入格式：**
一个JSON列表，每个对象包含\`feed_id\`（字符串）和\`title\`（字符串），例如：
\`[{"feed_id":"feed/https://...", "title":"带你上航母看舰载机"}, {"feed_id":"feed/https://...", "title":"全球经济预测：下半年增长放缓"}]\`

**输出格式：**
一个JSON列表，例如：
\`[{"feed_id": "feed/https://...", "title": "带你上航母看舰载机", "category": "军事"}, {"feed_id": "feed/https://...", "title": "全球经济预测：下半年增长放缓", "category": "经济"}]\`
`
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

    const statements: D1PreparedStatement[] = [];
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