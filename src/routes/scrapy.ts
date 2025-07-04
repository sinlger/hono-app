import { Hono } from 'hono'
import { Env } from '../db'
// import { fetch } from '@cloudflare/workers-types'


const API_URL = 'https://api-hot.imsyy.top/toutiao?cache=false';

/**
 * 获取并处理TopHub数据
 * @param c Hono上下文
 * @returns 处理结果
 */
export const scrapyRoutes = new Hono<{ Bindings: Env }>()
  .get('/scrapy/tophub', async (c) => {
    try {
      const response = await fetch(API_URL);
      const data: any = await response.json();
      for (const item of data.data) {
        // 检查数据库中是否已存在相同标题的数据
        const existingItem = await c.env.DB.prepare(
          'SELECT * FROM tophub WHERE item_id = ? OR title = ?'
        ).bind(item.id, item.title).first();
        if (!existingItem) {
          await c.env.DB.prepare(
            'INSERT INTO tophub (item_id, title, cover, timestamp, hot, url, mobileUrl, hasTT, hasWT, classify) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(
            item.id || '',
            item.title || '',
            item.cover || null,
            item.timestamp || Date.now(),
            item.hot || null,
            item.url || null,
            item.mobileUrl || null,
            item.hasTT || 0,
            item.hasWT || 0,
            item.classify || null
          ).run();
        }
      }

      return c.json({ success: true, message: '数据已处理' });
    } catch (error) {
      return c.json({ success: false, message: (error as Error).message }, 500);
    }
  })
