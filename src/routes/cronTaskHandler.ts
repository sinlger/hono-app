// src/cronHandler.ts
import { Env } from '../db'; // 导入环境变量接口

export async function handleScheduledTask(
  event: ScheduledController,
  env: Env,
  ctx: ExecutionContext // ExecutionContext 用于 ctx.waitUntil
): Promise<void> {
  console.log('[Cron Task] 正在执行数据获取和存储任务...');

  try {
    // 1. 调用本项目自身的 API 接口获取数据
    // 注意：在 Workers 环境中，如果 Worker 部署在 `your-worker-name.your-subdomain.workers.dev`，
    // 那么从 Worker 内部调用自身接口时，通常需要使用完整的 URL。
    // 在 `wrangler dev` 模式下，这个 URL 可能是 `http://localhost:8787/api/some-data`。
    // 在生产环境中，它将是你的实际 Worker URL。
    // 更好的做法是使用环境变量或硬编码你 Worker 的部署域名。
    // 为了简化，这里假设 Worker 的域名可以通过请求的原始URL来推断，但更严谨应该从环境变量获取。
    const API_URL = 'https://api-hot.imsyy.top/toutiao?cache=false';

    const response = await fetch(API_URL);
    const data: any = await response.json();
    const statements: D1PreparedStatement[] = [];
    // 遍历获取到的数据，为每个item准备一个批量插入语句
    for (const item of data.data) {
      // 使用 INSERT OR IGNORE。如果 item_id 或 title 已经存在，则跳过插入。
      // 注意：这要求 item_id 和 title 在表中具有 UNIQUE 约束。
      const insertStatement = env.DB.prepare(
        `INSERT OR IGNORE INTO tophub 
   (item_id, title, cover, timestamp, hot, url, mobileUrl, hasTT, hasWT, classify) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        item.id || null, // 对于空字符串或 undefined，D1 建议使用 null 存储
        item.title || null,
        item.cover || null,
        item.timestamp || Date.now(),
        item.hot || null,
        item.url || null,
        item.mobileUrl || null,
        item.hasTT || 0,
        item.hasWT || 0,
        item.classify || null
      );
      statements.push(insertStatement);
    }

    // 批量执行所有插入操作
    // c.executionCtx.waitUntil 用于确保异步 D1 操作在 Worker 终止前完成
    ctx.waitUntil(
      env.DB.batch(statements)
        .then((results) => {
          console.log(`[D1 Batch Insert] 成功执行 ${results.length} 条语句。`);
        })
        .catch((error) => {
          console.error('[D1 Batch Insert] 批量插入失败:', error);
        })
    );
  } catch (error) {
    console.error('[Cron Task] 定时任务执行中发生错误:', error);
  }
}