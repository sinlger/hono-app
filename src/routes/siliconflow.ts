import { Hono } from 'hono'
import { Env } from '../db'

// const API_KEY = process.env.SILICONFLOW_API_KEY;
/**
 * SiliconFlow API路由
 * @param c Hono上下文
 * @returns 处理结果
 */
export const siliconflowRoutes = new Hono<{ Bindings: Env }>()
  .post('/siliconflow/chat', async (c) => {
    try {
      const statementBox = c.env.DB.prepare('SELECT * FROM tophub WHERE classify IS NULL ORDER BY timestamp DESC LIMIT 10');
      const { results } = await statementBox.all();
      const userContent = results.map((item) => ({
        id: item.id,
        title: item.title,
      }))

      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${c.env.SILI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "model": "Qwen/Qwen3-14B", "stream": false, "max_tokens": 512, "enable_thinking": true, "thinking_budget": 4096, "min_p": 0.05, "temperature": 0.7, "top_p": 0.7, "top_k": 50, "frequency_penalty": 0.5, "n": 1, "stop": [], "messages": [{ "role": "system", "content": "好的，这次你的输入是一个字典列表，每个字典包含 `id` 和 `title`，输出需要在这个字典中添加一个 `classify` 字段。  请使用以下 Prompt 来实现你的要求：  -----  ## 新闻分类 Prompt  你是一个专业的**新闻分类AI**。你的任务是根据给定的**包含文章ID和标题的列表**，准确地判断每条新闻所属的**分类**，并在原始字典中添加分类信息，按照指定的格式输出。  **指令：**  1.  仔细阅读提供的每个文章标题。 2.  根据标题的语义内容，推断其最可能的新闻分类。 3.  如果一个标题可能属于多个分类，请选择最主要或最具体的分类。 4.  如果你认为某个标题无法归类，或者信息量不足以进行有效分类，请将其分类标记为“其他”或“无法分类”（请自行决定选择哪一个，并在输出中保持一致）。 5.  你的输出必须是一个JSON格式的列表，其中每个元素是原始字典（包含`id`和`title`），并添加了一个`classify`键值对。  **可供选择的分类（示例，你可以根据实际需求进行增删）：**    * **政治**   * **经济**   * **社会**   * **科技**   * **体育**   * **娱乐**   * **国际**   * **军事**   * **教育**   * **文化**   * **健康**   * **环境**   * **法律**   * **汽车**   * **房产**   * **旅游**   * **美食**   * **时尚**   * **其他**   * **无法分类**  **输入格式：**  一个Python列表，包含多个字典，每个字典包含`id`（整数）和`title`（字符串），例如： `[{id:139,title:\'带你上航母看舰载机\'}, {id:201,title:\'全球经济预测：下半年增长放缓\'}]`  **输出格式：**  一个JSON列表，例如： `[{\"title\": \"带你上航母看舰载机\", \"id\": 139, \"classify\": \"军事\"}, {\"title\": \"全球经济预测：下半年增长放缓\", \"id\": 201, \"classify\": \"经济\"}]`  **示例输入：**  ``` [{id:139,title:\'带你上航母看舰载机\'},{id:201,title:\'全球经济预测：下半年增长放缓\'},{id:310,title:\'北京地铁发生故障，部分线路停运\'}] ```  **预期输出：**  ```json [   {\"title\": \"带你上航母看舰载机\", \"id\": 139, \"classify\": \"军事\"},   {\"title\": \"全球经济预测：下半年增长放缓\", \"id\": 201, \"classify\": \"经济\"},   {\"title\": \"北京地铁发生故障，部分线路停运\", \"id\": 310, \"classify\": \"社会\"} ] ```" }, { "role": "user", "content": JSON.stringify(userContent) }] })
      }
      const response = await fetch(c.env.SILI_CHART_URL, options)
      const data = await response.json()
      const content = data.choices[0].message.content
      console.log('content', content)
      const jsonData = content.match(/```json\n([\s\S]*?)\n```/)[1];
      console.log('jsonData', jsonData)

      // 解析 JSON 数据
      const parsedData = JSON.parse(jsonData);
      console.log('parsedData', parsedData)

      const statements: D1PreparedStatement[] = [];
      for (const item of parsedData) {
        if (item.id && item.classify !== undefined) {
          // 准备 UPDATE 语句
          const statement = c.env.DB.prepare(
            'UPDATE tophub SET classify = ? WHERE id = ?'
          ).bind(item.classify, item.id);
          statements.push(statement);
        } else {
          console.warn(`跳过无效的更新项: ${JSON.stringify(item)}`);
        }
      }
      const batchResults = await c.env.DB.batch(statements);
      console.log(`[D1 Batch Insert] 成功执行 ${batchResults.length} 条语句。`);
      return c.json({ success: true, message: `成功分类并更新了 ${batchResults.length} 条新闻数据` });
    } catch (error) {
      return c.json({ success: false, message: (error as Error).message }, 500);
    }
  })