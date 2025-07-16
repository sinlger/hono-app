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
                      item_id: { type: 'string', description: "from entry.id" },
                      feed_id: { type: 'string', description: "from entry.feedId" },
                      title: { type: 'string', description: "from entry.title" },
                      author: { type: 'string', description: "from entry.author" },
                      url: { type: 'string', description: "from entry.url" },
                      guid: { type: 'string', description: "from entry.guid" },
                      description: { type: 'string', description: "from entry.description" },
                      content: { type: 'string', description: "from entry.content" },
                      media: { type: 'object', description: 'from entry.media (as JSON string)' },
                      published_at: { type: 'string', format: 'date-time', description: 'from entry.publishedAt' },
                      inserted_at: { type: 'string', format: 'date-time', description: 'from entry.insertedAt' },
                      category: { type: 'string', description: 'for classification' }
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
    },
    '/webhook/push': {
      post: {
        summary: '接收 Webhook 推送',
        description: '接收并处理来自外部服务的 webhook 推送。',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: '任意有效的 JSON 对象',
                example: { key: 'value', nested: { a: 1 } }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Webhook 成功接收',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Webhook received successfully'
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
                      example: 'Failed to process webhook'
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