export async function getTopHubItems(db) {
  if (!db) {
    throw new Error('Database connection not available');
  }

  try {
    const { results } = await db
      .prepare('SELECT * FROM tophub ORDER BY inserted_at DESC LIMIT 50')
      .all();
    return results || [];
  } catch (error) {
    throw new Error('Failed to fetch TopHub items from database');
  }
}

export async function insertTopHubItem(db, item) {
  if (!db) {
    throw new Error('Database connection not available');
  }

  if (!item.item_id) {
    throw new Error('Required fields missing: item_id is required');
  }

  try {
    return await db
      .prepare(
        'INSERT INTO tophub (item_id, feed_id, title, author, url, guid, description, content, media, published_at, inserted_at, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        item.item_id,
        item.feed_id || null,
        item.title,
        item.author || null,
        item.url || null,
        item.guid || null,
        item.description || null,
        item.content || null,
        item.media || null,
        item.published_at || null,
        item.inserted_at || null,
        item.category || null
      )
      .run();
  } catch (error) {
    throw new Error('Failed to insert TopHub item into database');
  }
}