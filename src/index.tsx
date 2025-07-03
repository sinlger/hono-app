import { Hono } from 'hono'
import { renderer } from './renderer'
import { swaggerUI } from '@hono/swagger-ui'
import { routes } from './routes'
import { openApiDoc } from './openapi'

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
  fetch: app.fetch,
  async scheduled(event, env, ctx) {
    const scrapyTophubJob = async () => {
      try {
        // 传递环境变量
        const response = await app.request('/scrapy/tophub', {
          headers: {'CF-Env': JSON.stringify(env)}
        });
        
        if (!response.ok) {
          console.error('定时任务失败:', await response.text());
        } else {
          console.log('定时任务执行成功');
        }
      } catch (error) {
        console.error('定时任务异常:', error);
      }
    };
    ctx.waitUntil(scrapyTophubJob());
  }
}
