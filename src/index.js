import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';
import { routes } from './routes';
import { openApiDoc } from './openapi';
import { handleScheduledClassTask } from './routes/cronTaskHandler.js';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello! 这是一个基于 Hono 的 API 服务。');
});

app.route('/', routes);

// 提供OpenAPI文档端点
app.get('/doc', (c) => c.json(openApiDoc));

// 添加Swagger UI
app.get('/ui', swaggerUI({ url: '/doc' }));

// 添加一个临时路由来手动触发定时任务以进行测试
app.get('/test-cron', async (c) => {
  console.log('手动触发定时任务以进行测试...');
  try {
    // 模拟一个 event 对象，并传递 env 和空的 ctx
    await handleScheduledClassTask({ cron: '*/10 * * * *' }, c.env, c.executionCtx);
    console.log('手动触发定时任务完成。');
    return c.text('定时任务已成功触发！');
  } catch (error) {
    console.error('手动触发定时任务时出错:', error);
    return c.text('触发定时任务时出错，请检查控制台。', 500);
  }
});


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
      // case "*/10 * * * *":
      //   console.log('我每十分钟执行一次');
      //   await handleScheduledClassTask(event, env, ctx);
      //   break;
      // default:
      //   console.warn(`[Cron Trigger] 未知或未处理的 Cron 表达式: ${cronExpression}`);
      //   break;
    }
    // console.log(`[Cron Trigger] 表达式 "${cronExpression}" 的任务执行完毕。`);
  }
};