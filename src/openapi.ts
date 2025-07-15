export const openApiDoc = {
  openapi: '3.0.0',
  info: {
    title: 'Hono App API',
    version: '1.0.0',
    description: 'API documentation for Hono App'
  },
  paths: {

    '/folo/webhook': {
      post: {
        summary: '接收 Folo Actions 的 Webhook',
        description: '接收 Folo Actions 推送的数据并将其存入数据库。',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  entry: {
                    type: 'object',
                    properties: {
                      item_id: { type: 'string', description: "Entry's unique ID" },
                      feed_id: { type: 'string', description: "Feed's ID" },
                      title: { type: 'string', description: "Entry's title" },
                      author: { type: 'string', description: "Entry's author" },
                      url: { type: 'string', description: "Entry's URL" },
                      guid: { type: 'string', description: "Entry's GUID" },
                      description: { type: 'string', description: "Entry's description" },
                      content: { type: 'string', description: "Entry's full content" },
                      media: { type: 'object', description: 'Media content, stored as JSON' },
                      published_at: { type: 'string', format: 'date-time', description: 'Publication timestamp' },
                      inserted_at: { type: 'string', format: 'date-time', description: 'Insertion timestamp' },
                      category: { type: 'string', description: 'Category for the entry (optional)' }
                    },
                    required: ['item_id', 'feed_id', 'title', 'url', 'published_at', 'inserted_at']
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: '数据成功保存',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Data saved successfully'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: '无效的请求体',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Invalid Folo Action payload'
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: '服务器错误',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Failed to save data'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {}
  }
}