import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';
import { routes } from './routes';
import { openApiDoc } from './openapi';
import { handleScheduledClassTask } from './routes/cronTaskHandler.js';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello!');
});

app.route('/', routes);

// 提供OpenAPI文档端点
app.get('/doc', (c) => c.json(openApiDoc));

// 添加Swagger UI
app.get('/ui', swaggerUI({ url: '/doc' }));

export default {
  async fetch(request, env, ctx) {
    // 将所有 fetch 事件委托给 Hono 应用处理
    return app.fetch(request, env, ctx);
  },
  /**
   * 处理定时任务 (scheduled event)
   */
  async scheduled(event, env, ctx) {
    const cronExpression = event.cron;
    switch (cronExpression) {
      //   case "0 * * * *":
      //     // 每小时执行一次
      //     await handleScheduledScrapyTask(event, env, ctx);
      //     break;
      case "*/10 * * * *":
        console.log('我每十分钟执行一次');
        await handleScheduledClassTask(event, env, ctx);
        break;
      default:
        console.warn(`[Cron Trigger] 未知或未处理的 Cron 表达式: ${cronExpression}`);
        break;
    }
    console.log(`[Cron Trigger] 表达式 "${cronExpression}" 的任务执行完毕。`);
  }
};