import { Hono } from 'hono'
import { Env, getTopHubItems, insertTopHubItem } from '../db'

export const tophubRoutes = new Hono<{ Bindings: Env }>()
  .get('/api/tophub', async (c) => {
    try {
      const items = await getTopHubItems(c.env.DB)
      return c.json(items)
    } catch (error) {
      return c.json({ error: 'Failed to fetch TopHub items' }, 500)
    }
  })
  .post('/api/tophub', async (c) => {
    try {
      const data = await c.req.json()
      const result = await insertTopHubItem(c.env.DB, data)
      return c.json(result)
    } catch (error) {
      return c.json({ error: 'Failed to insert TopHub item' }, 500)
    }
  })