import { D1Database } from '@cloudflare/workers-types'

export interface Env {
  DB: D1Database,
  SILI_CHART_URL: string,
  SILI_API_KEY: string
}

export interface TopHub {
  id: number
  item_id: string
  title: string
  cover: string
  timestamp: number
  hot: string
  url: string
  mobileUrl: string
  hasTT: number
  hasWT: number
  created_at: string
  classify: string
}

export async function getTopHubItems(db: D1Database) {
  if (!db) {
    throw new Error('Database connection not available')
  }

  try {
    const { results } = await db
      .prepare('SELECT * FROM tophub ORDER BY created_at DESC LIMIT 50')
      .all<TopHub>()
    return results || []
  } catch (error) {
    throw new Error('Failed to fetch TopHub items from database')
  }
}

export async function insertTopHubItem(db: D1Database, item: Omit<TopHub, 'id' | 'created_at'>) {
  if (!db) {
    throw new Error('Database connection not available')
  }

  if (!item.item_id || !item.title) {
    throw new Error('Required fields missing: item_id and title are required')
  }

  try {
    return await db
      .prepare(
        'INSERT INTO tophub (item_id, title, cover, timestamp, hot, url, mobileUrl, hasTT, hasWT, classify) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        item.item_id,
        item.title,
        item.cover || null,
        item.timestamp || null,
        item.hot || null,
        item.url || null,
        item.mobileUrl || null,
        item.hasTT || 0,
        item.hasWT || 0,
        item.classify || null
      )
      .run()
  } catch (error) {
    throw new Error('Failed to insert TopHub item into database')
  }
}