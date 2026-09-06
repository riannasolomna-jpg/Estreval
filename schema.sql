CREATE TABLE IF NOT EXISTS posts (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL,
 category TEXT NOT NULL,
 section TEXT NOT NULL,
 excerpt TEXT DEFAULT '',
 image TEXT DEFAULT '',
 blocks TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_posts_category_section ON posts(category,section);
