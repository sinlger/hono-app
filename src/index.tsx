import { Hono } from 'hono'
import { renderer } from './renderer'
import { swaggerUI } from '@hono/swagger-ui'
import { Env, getTopHubItems, insertTopHubItem } from './db'

const app = new Hono<{ Bindings: Env }>()

app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello!</h1>)
})

// API endpoints
app.get('/api/tophub', async (c) => {
  try {
    const items = await getTopHubItems(c.env.DB)
    return c.json(items)
  } catch (error) {
    console.error('Error fetching TopHub items:', error)
    return c.json({ error: 'Failed to fetch TopHub items' }, 500)
  }
})

app.post('/api/tophub', async (c) => {
  try {
    const data = await c.req.json()
    const result = await insertTopHubItem(c.env.DB, data)
    return c.json(result)
  } catch (error) {
    console.error('Error inserting TopHub item:', error)
    return c.json({ error: 'Failed to insert TopHub item' }, 500)
  }
})

// OpenAPI document
const openApiDoc = {
  openapi: '3.0.0',
  info: {
    title: 'Hono App API',
    version: '1.0.0',
    description: 'API documentation for Hono App'
  },
  paths: {
    '/': {
      get: {
        summary: 'Get home page',
        responses: {
          '200': {
            description: 'Success'
          }
        }
      }
    },
    '/api/tophub': {
      get: {
        summary: 'Get TopHub items',
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      item_id: { type: 'string' },
                      title: { type: 'string' },
                      cover: { type: 'string' },
                      timestamp: { type: 'integer' },
                      hot: { type: 'string' },
                      url: { type: 'string' },
                      mobileUrl: { type: 'string' },
                      hasTT: { type: 'integer' },
                      hasWT: { type: 'integer' },
                      created_at: { type: 'string' },
                      classify: { type: 'string' }
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new TopHub item',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['item_id', 'title'],
                properties: {
                  item_id: { type: 'string' },
                  title: { type: 'string' },
                  cover: { type: 'string' },
                  timestamp: { type: 'integer' },
                  hot: { type: 'string' },
                  url: { type: 'string' },
                  mobileUrl: { type: 'string' },
                  hasTT: { type: 'integer' },
                  hasWT: { type: 'integer' },
                  classify: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Success'
          },
          '500': {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// Serve the OpenAPI document
app.get('/doc', (c) => c.json(openApiDoc))

// Use Swagger UI
app.get('/ui', swaggerUI({ url: '/doc' }))

export default app
