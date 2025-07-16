export async function getTopHubItems(db) {
  if (!db) {
    throw new Error('Database connection not available');
  }

  try {
    const { results } = await db
      .prepare('SELECT * FROM tophub ORDER BY created_at DESC LIMIT 50')
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

  if (!item.item_id || !item.title) {
    throw new Error('Required fields missing: item_id and title are required');
  }

  try {
    return await db
      .prepare(
        'INSERT INTO tophub (item_id, title, cover, timestamp, hot, url, mobileUrl, hasTT, hasWT, classify) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        item.item_id,
        item.title,
        item.cover || null,
        item.timestamp || null,
        item.hot || null,
        item.url || null,
        item.mobileUrl || null,
        item.hasTT || 0,
        item.hasWT || 0,
        item.classify || null
      )
      .run();
  } catch (error) {
    throw new Error('Failed to insert TopHub item into database');
  }
}