import { Hono } from 'hono';
import { jwt } from 'hono/jwt';

export const foloRoutes = new Hono();

// JWT 中间件配置
const jwtSecret = 'your-secret-key-here'; // 在生产环境中应该使用环境变量

// 测试用的 JWT token 生成接口（仅用于开发测试）
foloRoutes.post('/folo/auth/token', async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    // 简单的用户验证（在生产环境中应该使用真实的用户验证）
    if (username === 'admin' && password === 'Flzxqc@') {
      const payload = {
        sub: username,
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1小时过期
      };
      
      // 使用 Hono 的 sign 函数生成 JWT
      const { sign } = await import('hono/jwt');
      const token = await sign(payload, jwtSecret);
      
      return c.json({
        success: true,
        token,
        expiresIn: '1h'
      });
    } else {
      return c.json({
        success: false,
        message: 'Invalid credentials'
      }, 401);
    }
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error generating token',
      error: error.message
    }, 500);
  }
});

// 查询接口 - 支持 title、author、url 参数以及分页（需要 JWT 认证）
// foloRoutes.get('/folo/search', jwt({ secret: jwtSecret }), async (c) => {
foloRoutes.get('/folo/search', async (c) => {
  try {
    const { title, author, url, startTime, endTime, page = 1, limit = 10 } = c.req.query();
    
    // 验证分页参数
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10)); // 限制最大100条
    const offset = (pageNum - 1) * limitNum;
    
    // 构建查询条件
    let whereConditions = [];
    let bindParams = [];
    
    if (title) {
      whereConditions.push('title LIKE ?');
      bindParams.push(`%${title}%`);
    }
    
    if (author) {
      whereConditions.push('author LIKE ?');
      bindParams.push(`%${author}%`);
    }
    
    if (url) {
      whereConditions.push('url LIKE ?');
      bindParams.push(`%${url}%`);
    }
    
    // 时间段查询
    if (startTime) {
      // 验证时间格式 YYYY-MM-DD HH:mm:ss
      const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
      if (!timeRegex.test(startTime)) {
        return c.json({
          success: false,
          message: 'startTime format should be YYYY-MM-DD HH:mm:ss'
        }, 400);
      }
      whereConditions.push('inserted_at >= ?');
      bindParams.push(startTime);
    }
    
    if (endTime) {
      // 验证时间格式 YYYY-MM-DD HH:mm:ss
      const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
      if (!timeRegex.test(endTime)) {
        return c.json({
          success: false,
          message: 'endTime format should be YYYY-MM-DD HH:mm:ss'
        }, 400);
      }
      whereConditions.push('inserted_at <= ?');
      bindParams.push(endTime);
    }
    
    // 构建 WHERE 子句
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    // 查询总数
    const countQuery = `SELECT COUNT(*) as total FROM tophub ${whereClause}`;
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...bindParams)
      .first();
    
    const total = countResult.total || 0;
    
    // 查询数据
    const dataQuery = `
      SELECT item_id, feed_id, title, author, url, guid, description, content,
             published_at, inserted_at, category
      FROM tophub 
      ${whereClause}
      ORDER BY inserted_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const results = await c.env.DB.prepare(dataQuery)
      .bind(...bindParams, limitNum, offset)
      .all();
    
    // 计算分页信息
    const totalPages = Math.ceil(total / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;
    
    return c.json({
      success: true,
      data: results.results || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext,
        hasPrev
      },
      filters: {
        title: title || null,
        author: author || null,
        url: url || null,
        startTime: startTime || null,
        endTime: endTime || null
      }
    });
    
  } catch (error) {
    console.error('Error searching data:', error);
    return c.json({ 
      success: false, 
      message: 'Error searching data',
      error: error.message 
    }, 500);
  }
});

foloRoutes.post('/folo/webhook', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Received webhook data:', JSON.stringify(body, null, 2));
    const { entry } = body;

    if (!entry) {
      return c.json({ success: false, message: 'Invalid Folo webhook payload' }, 400);
    }

    // Extract and map fields from entry
    const item = {
      item_id: entry.id,
      feed_id: entry.feedId,
      title: entry.title || null,
      author: entry.author || null,
      url: entry.url || null,
      guid: entry.guid,
      description: entry.description || null,
      content: entry.content || null,
      media: entry.media || null,
      published_at: entry.publishedAt,
      inserted_at: entry.insertedAt,
      category: entry.category || null,
    };

    // Check if the item already exists
    const itemExists = await checkItemExists(c.env.DB, item.item_id);
    if (itemExists) {
      return c.json({ success: true, message: 'Item already exists', skipped: true });
    }

    // Insert the new item
    await insertFoloItem(c.env.DB, item);

    return c.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error processing Folo webhook:', error);
    
    // Return appropriate error response based on error type
    if (error.message.includes('Missing required fields')) {
      return c.json({ success: false, message: error.message }, 400);
    }
    
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
});