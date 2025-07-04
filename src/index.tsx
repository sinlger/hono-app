import { Hono } from 'hono'
import { renderer } from './renderer'
import { swaggerUI } from '@hono/swagger-ui'
import { routes } from './routes'
import { Env } from './db'; // 导入环境变量接口和类型定义
import { openApiDoc } from './openapi'
import { handleScheduledTask } from './routes/cronTaskHandler'; // 假设你的定时任务逻辑在这个文件

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
    console.log(`[Cron Trigger] 定时任务在 ${new Date(event.scheduledTime).toISOString()} 触发。`);
    // 将定时任务的具体逻辑委托给单独的函数处理
    await handleScheduledTask(event, env, ctx);
    console.log('[Cron Trigger] 定时任务执行完毕。');
  },
}