-- 创建 tophub 表，包含所有字段
CREATE TABLE tophub (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT NOT NULL UNIQUE, -- from entry.id
  feed_id TEXT,                 -- from entry.feedId
  title TEXT,                   -- from entry.title
  author TEXT,                  -- from entry.author
  url TEXT,                     -- from entry.url
  guid TEXT,                    -- from entry.guid
  description TEXT,             -- from entry.description
  content TEXT,                 -- from entry.content
  media TEXT,                   -- from entry.media (as JSON string)
  published_at DATETIME,        -- from entry.publishedAt
  inserted_at DATETIME,         -- from entry.insertedAt
  category TEXT                 -- for classification
);