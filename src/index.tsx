import { Hono } from 'hono'
import { renderer } from './renderer'
import { swaggerUI } from '@hono/swagger-ui'
import { routes } from './routes'
import { Env } from './db'; // 导入环境变量接口和类型定义
import { openApiDoc } from './openapi'
import { handleScheduledClassTask } from './routes/cronTaskHandler'; // 假设你的定时任务逻辑在这个文件

const app = new Hono()

app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello!</h1>)
})

app.route('/', routes)

// 提供OpenAPI文档端点
app.get('/doc', (c) => c.json(openApiDoc))

// 添加Swagger UI
app.get('/ui', swaggerUI({ url: '/doc' }))


export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 将所有 fetch 事件委托给 Hono 应用处理
    return app.fetch(request, env, ctx);
  },
  /**
   * 处理定时任务 (scheduled event)
   */
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    const cronExpression = event.cron;
    // switch (cronExpression) {
    //   case "0 * * * *":
    //     // 每小时执行一次
    //     await handleScheduledScrapyTask(event, env, ctx);
    //     break;
    //   case "*/10 * * * *":
    //     console.log('我每十分钟执行一次');
    //     await handleScheduledClassTask(event, env, ctx);
    //     break;
    //   default:
    //     console.warn(`[Cron Trigger] 未知或未处理的 Cron 表达式: ${cronExpression}`);
    //     break;
    // }
    console.log(`[Cron Trigger] 表达式 "${cronExpression}" 的任务执行完毕。`);
  }
}