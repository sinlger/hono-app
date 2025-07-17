import { Hono } from 'hono';

export const foloRoutes = new Hono();

// Database operations for Folo webhook
async function checkItemExists(db, itemId) {
  if (!db) {
    throw new Error('Database connection not available');
  }
  
  try {
    const result = await db.prepare('SELECT item_id FROM tophub WHERE item_id = ?').bind(itemId).first();
    return !!result;
  } catch (error) {
    console.error('Database error in checkItemExists:', error);
    throw new Error('Failed to check if item exists in database');
  }
}

async function insertFoloItem(db, item) {
  if (!db) {
    throw new Error('Database connection not available');
  }

  // Validate required fields
  if (!item.item_id) {
    throw new Error('Missing required field: item_id');
  }

  try {
    const mediaJson = item.media ? JSON.stringify(item.media) : null;
    
    return await db.prepare(
      `INSERT INTO tophub (
        item_id, feed_id, title, author, url, guid, description, content, media, published_at, inserted_at, category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        item.item_id,
        item.feed_id,
        item.title,
        item.author,
        item.url,
        item.guid,
        item.description,
        item.content,
        mediaJson,
        item.published_at ? new Date(item.published_at).toISOString() : null,
        item.inserted_at ? new Date(item.inserted_at).toISOString() : null,
        item.category
      )
      .run();
  } catch (error) {
    throw new Error('Failed to insert Folo item into database');
  }
}

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