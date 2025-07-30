export const openApiDoc = {
  openapi: '3.0.0',
  info: {
    title: 'Hono App API',
    version: '1.0.0',
    description: 'API documentation for Hono App'
  },
  servers: [
    {
      url: 'http://localhost:5173',
      description: 'Development server'
    },
    {
      url: 'https://atoolio.com',
      description: 'Production server'
    }
  ],
  paths: {

    '/folo/auth/token': {
      post: {
        summary: '生成 JWT Token',
        description: '用于测试的 JWT token 生成接口（用户名: admin, 密码: password）',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: {
                    type: 'string',
                    example: 'admin'
                  },
                  password: {
                    type: 'string',
                    example: 'password'
                  }
                },
                required: ['username', 'password']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Token 生成成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    token: {
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    },
                    expiresIn: {
                      type: 'string',
                      example: '1h'
                    }
                  }
                }
              }
            }
          },
           '400': {
             description: '请求参数错误',
             content: {
               'application/json': {
                 schema: {
                   type: 'object',
                   properties: {
                     success: {
                       type: 'boolean',
                       example: false
                     },
                     message: {
                       type: 'string',
                       example: 'startTime format should be YYYY-MM-DD HH:mm:ss'
                     }
                   }
                 }
               }
             }
           },
           '401': {
            description: '认证失败',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: false
                    },
                    message: {
                      type: 'string',
                      example: 'Invalid credentials'
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
                    success: {
                      type: 'boolean',
                      example: false
                    },
                    message: {
                      type: 'string',
                      example: 'Error generating token'
                    },
                    error: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/folo/search': {
      get: {
        summary: '搜索数据',
        description: '根据标题、作者、URL等条件搜索数据，支持分页功能。需要 JWT 认证。',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'title',
            in: 'query',
            description: '按标题模糊搜索',
            required: false,
            schema: {
              type: 'string'
            }
          },
          {
            name: 'author',
            in: 'query',
            description: '按作者模糊搜索',
            required: false,
            schema: {
              type: 'string'
            }
          },
          {
            name: 'url',
            in: 'query',
            description: '按URL模糊搜索',
            required: false,
            schema: {
              type: 'string'
            }
          },
          {
            name: 'category',
            in: 'query',
            description: '按分类搜索',
            required: false,
            schema: {
              type: 'string'
            }
          },
          {
            name: 'page',
            in: 'query',
            description: '页码，默认为1',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1,
              default: 1
            }
          },
          {
             name: 'limit',
             in: 'query',
             description: '每页条数，默认10条，最大100条',
             required: false,
             schema: {
               type: 'integer',
               minimum: 1,
               maximum: 100,
               default: 10
             }
           },
           {
             name: 'startTime',
             in: 'query',
             description: '开始时间，格式：YYYY-MM-DD HH:mm:ss',
             required: false,
             schema: {
               type: 'string',
               pattern: '^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$',
               example: '2024-01-01 00:00:00'
             }
           },
           {
             name: 'endTime',
             in: 'query',
             description: '结束时间，格式：YYYY-MM-DD HH:mm:ss',
             required: false,
             schema: {
               type: 'string',
               pattern: '^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$',
               example: '2024-12-31 23:59:59'
             }
           }
        ],
        responses: {
          '200': {
            description: '搜索成功',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          item_id: { type: 'string', description: '条目ID' },
                          feed_id: { type: 'string', description: '源ID' },
                          title: { type: 'string', description: '标题' },
                          author: { type: 'string', description: '作者' },
                          url: { type: 'string', description: 'URL链接' },
                          guid: { type: 'string', description: 'GUID' },
                          description: { type: 'string', description: '描述' },
                          published_at: { type: 'string', format: 'date-time', description: '发布时间' },
                          inserted_at: { type: 'string', format: 'date-time', description: '插入时间' },
                          category: { type: 'string', description: '分类' }
                        }
                      }
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer', description: '当前页码' },
                        limit: { type: 'integer', description: '每页条数' },
                        total: { type: 'integer', description: '总条数' },
                        totalPages: { type: 'integer', description: '总页数' },
                        hasNext: { type: 'boolean', description: '是否有下一页' },
                        hasPrev: { type: 'boolean', description: '是否有上一页' }
                      }
                    },
                    filters: {
                       type: 'object',
                       properties: {
                         title: { type: 'string', nullable: true, description: '标题过滤条件' },
                         author: { type: 'string', nullable: true, description: '作者过滤条件' },
                         url: { type: 'string', nullable: true, description: 'URL过滤条件' },
                         startTime: { type: 'string', nullable: true, description: '开始时间过滤条件' },
                         endTime: { type: 'string', nullable: true, description: '结束时间过滤条件' }
                       }
                     }
                  }
                }
              }
            }
         },
         '401': {
           description: 'JWT 认证失败',
           content: {
             'application/json': {
               schema: {
                 type: 'object',
                 properties: {
                   message: {
                     type: 'string',
                     example: 'Unauthorized'
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
                    success: {
                      type: 'boolean',
                      example: false
                    },
                    message: {
                      type: 'string',
                      example: 'Error searching data'
                    },
                    error: {
                      type: 'string',
                      example: 'Database connection failed'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
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
    '/folo/webhook/guonei': {
      post: {
        summary: '接收国内新闻 Folo Actions 的 Webhook',
        description: '接收 Folo Actions 推送的国内新闻数据并将其存入数据库，自动分类为"国内新闻"。',
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
                      inserted_at: { type: 'string', format: 'date-time', description: 'from entry.insertedAt' }
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
            description: '数据成功保存或已存在',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'Data saved successfully'
                    },
                    skipped: {
                      type: 'boolean',
                      description: '当数据已存在时为 true',
                      example: false
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
                    success: {
                      type: 'boolean',
                      example: false
                    },
                    message: {
                      type: 'string',
                      example: 'Invalid Folo webhook payload'
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
                    success: {
                      type: 'boolean',
                      example: false
                    },
                    message: {
                      type: 'string',
                      example: 'Internal server error'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/folo/webhook/guoji': {
      post: {
        summary: '接收国际新闻 Folo Actions 的 Webhook',
        description: '接收 Folo Actions 推送的国际新闻数据并将其存入数据库，自动分类为"国际新闻"。',
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
                      inserted_at: { type: 'string', format: 'date-time', description: 'from entry.insertedAt' }
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
            description: '数据成功保存或已存在',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'Data saved successfully'
                    },
                    skipped: {
                      type: 'boolean',
                      description: '当数据已存在时为 true',
                      example: false
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
                    success: {
                      type: 'boolean',
                      example: false
                    },
                    message: {
                      type: 'string',
                      example: 'Invalid Folo webhook payload'
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
                    success: {
                      type: 'boolean',
                      example: false
                    },
                    message: {
                      type: 'string',
                      example: 'Internal server error'
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
    schemas: {},
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for authentication'
      }
    }
  }
}