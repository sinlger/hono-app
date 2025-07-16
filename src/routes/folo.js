import { Hono } from 'hono';

export const foloRoutes = new Hono();

foloRoutes.post('/folo/webhook', async (c) => {
  try {
    const body = await c.req.json();
    const { entry } = body;

    if (!entry) {
      return c.json({ success: false, message: 'Invalid Folo Action payload' }, 400);
    }

    const {
      item_id,
      feed_id,
      title,
      author,
      url,
      guid,
      description,
      content,
      media,
      published_at,
      inserted_at,
      category
    } = entry;

    // Check if the item already exists
    const existingItem = await c.env.DB.prepare('SELECT id FROM tophub WHERE item_id = ?').bind(item_id).first();

    if (existingItem) {
      return c.json({ message: 'Item already exists' });
    }

    const mediaJson = media ? JSON.stringify(media) : null;

    await c.env.DB.prepare(
      `INSERT INTO tophub (
        item_id, feed_id, title, author, url, guid, description, content, media, published_at, inserted_at, category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        item_id,
        feed_id,
        title,
        author,
        url,
        guid,
        description,
        content,
        mediaJson,
        published_at ? new Date(published_at).toISOString() : null,
        inserted_at ? new Date(inserted_at).toISOString() : null,
        category // Bind the category value
      )
      .run();

    return c.json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error processing Folo Action:', error);
    return c.json({ success: false, message: 'Error processing Folo Action' }, 500);
  }
});