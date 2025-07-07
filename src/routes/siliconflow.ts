import { Hono } from 'hono'
import { Env } from '../db'

const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const API_KEY = process.env.SILICONFLOW_API_KEY;
/**
 * SiliconFlow API路由
 * @param c Hono上下文
 * @returns 处理结果
 */
export const siliconflowRoutes = new Hono<{ Bindings: Env }>()
  .post('/siliconflow/chat', async (c) => {
    try {
      // 获取请求体
      const body = await c.req.json();
      
      // 发送请求到SiliconFlow API
      const response = await fetch(API_URL, {
      "model": "Qwen/Qwen3-14B",
      "stream": false,
      "max_tokens": 512,
      "enable_thinking": false,
      "thinking_budget": 4096,
      "min_p": 0.05,
      "temperature": 0.7,
      "top_p": 0.7,
      "top_k": 50,
      "frequency_penalty": 0.5,
      "n": 1, "stop": [],
      "messages": [
        { "role": "system", "content": "## 新闻分类 Prompt  你是一个专业的**新闻分类AI**。你的任务是根据给定的**文章标题列表**，准确地判断每条新闻所属的**分类**，并按照指定的格式输出。  **指令：**  1.  仔细阅读提供的每个文章标题。 2.  根据标题的语义内容，推断其最可能的新闻分类。 3.  如果一个标题可能属于多个分类，请选择最主要或最具体的分类。 4.  如果你认为某个标题无法归类，或者信息量不足以进行有效分类，请将其分类标记为“其他”或“无法分类”（请自行决定选择哪一个，并在输出中保持一致）。 5.  你的输出必须是一个JSON格式的列表，其中每个元素是一个包含`title`和`classify`键值对的字典。  **可供选择的分类（示例，你可以根据实际需求进行增删）：**    * **政治**   * **经济**   * **社会**   * **科技**   * **体育**   * **娱乐**   * **国际**   * **军事**   * **教育**   * **文化**   * **健康**   * **环境**   * **法律**   * **汽车**   * **房产**   * **旅游**   * **美食**   * **时尚**   * **其他**   * **无法分类**  **输入格式：**  一个Python列表，包含多个字符串形式的文章标题，例如： `[\'标题1\', \'标题2\', \'标题3\']`  **输出格式：**  一个JSON列表，例如： `[{\"title\": \"标题1\", \"classify\": \"分类1\"}, {\"title\": \"标题2\", \"classify\": \"分类2\"}]`  **示例输入：**  ``` [\'美国总统签署新法案，旨在控制通货膨胀\',\'科学家发现新型材料，有望彻底改变电池技术\',\'某地发生重大交通事故，造成多人伤亡\',\'某明星宣布暂退娱乐圈，引发粉丝热议\',\'全国高温预警持续，多地气温突破历史极值\'] ```  **预期输出：**  ```json [   {\"title\": \"美国总统签署新法案，旨在控制通货膨胀\", \"classify\": \"政治\"},   {\"title\": \"科学家发现新型材料，有望彻底改变电池技术\", \"classify\": \"科技\"},   {\"title\": \"某地发生重大交通事故，造成多人伤亡\", \"classify\": \"社会\"},   {\"title\": \"某明星宣布暂退娱乐圈，引发粉丝热议\", \"classify\": \"娱乐\"},   {\"title\": \"全国高温预警持续，多地气温突破历史极值\", \"classify\": \"环境\"} ] ```   " },
        { "role": "user", "content": "[\'博主：歼20赶走的可能是F-35A\']" }
      ]
    },{
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      // 获取响应数据
      const data = await response.json();
      
      // 返回响应
      return c.json(data);
    } catch (error) {
      return c.json({ success: false, message: (error as Error).message }, 500);
    }
  })