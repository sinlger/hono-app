export const openApiDoc = {
  openapi: '3.0.0',
  info: {
    title: 'Hono App API',
    version: '1.0.0',
    description: 'API documentation for Hono App'
  },
  paths: {
    '/siliconflow/chat': {
      post: {
        summary: '使用SiliconFlow API进行新闻分类',
        description: '从数据库获取未分类的新闻，使用SiliconFlow API进行分类，并更新数据库',
        responses: {
          '200': {
            description: '成功处理数据',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    choices: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          message: {
                            type: 'object',
                            properties: {
                              content: { type: 'string' }
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
          '500': {
            description: '服务器错误',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: '错误信息' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/tophub': {
      get: {
        summary: '获取TopHub项目列表',
        responses: {
          '200': {
            description: '成功',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/TopHubItem'
                  }
                }
              }
            }
          },
          '500': {
            description: '服务器错误'
          }
        }
      },
      post: {
        summary: '创建新的TopHub项目',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TopHubItem'
              }
            }
          }
        },
        responses: {
          '200': {
            description: '成功'
          },
          '500': {
            description: '服务器错误'
          }
        }
      }
    },
    '/scrapy/tophub': {
      get: {
        summary: '从外部API抓取TopHub数据并存入数据库',
        description: '请求外部API获取数据，检查数据库重复后存入',
        responses: {
          '200': {
            description: '成功处理数据',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: '数据已处理' }
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
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: '错误信息' }
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
    schemas: {
      TopHubItem: {
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
          classify: { type: 'string' }
        }
      }
    }
  }
}