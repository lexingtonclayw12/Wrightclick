/* ============================================
   Wright Click Studio — Social Media Server
   Node.js + Express backend
   ============================================ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const cron = require('node-cron');

const leadsRouter = require('./routes/leads');
const socialRouter = require('./routes/social');
const configRouter = require('./routes/config');

const app = express();
const PORT = process.env.PORT || 3001;

/* ------------------------------------------
   DB INIT
------------------------------------------ */
const db = new Database(path.join(__dirname, 'data.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL UNIQUE,
    website_url TEXT,
    business_type TEXT,
    challenge TEXT,
    status TEXT DEFAULT 'new',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scheduled_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    content TEXT NOT NULL,
    hashtags TEXT,
    media_url TEXT,
    scheduled_for DATETIME,
    status TEXT DEFAULT 'pending',
    published_id TEXT,
    error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

app.locals.db = db;

/* ------------------------------------------
   MIDDLEWARE
------------------------------------------ */
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ------------------------------------------
   ROUTES
------------------------------------------ */
app.use('/api/leads', leadsRouter);
app.use('/api/posts', socialRouter);
app.use('/api/config', configRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

/* ------------------------------------------
   SCHEDULER — publish queued posts
------------------------------------------ */
cron.schedule('* * * * *', async () => {
  const now = new Date().toISOString();
  const due = db.prepare(`
    SELECT * FROM scheduled_posts
    WHERE status = 'pending' AND scheduled_for <= ?
    LIMIT 5
  `).all(now);

  for (const post of due) {
    try {
      const { publishPost } = require('./routes/social');
      const result = await publishPost(db, post.platform, post.content, post.hashtags, post.media_url);
      db.prepare(`UPDATE scheduled_posts SET status='published', published_id=? WHERE id=?`).run(result.id || 'ok', post.id);
      console.log(`[scheduler] Published ${post.platform} post #${post.id}`);
    } catch (err) {
      db.prepare(`UPDATE scheduled_posts SET status='failed', error=? WHERE id=?`).run(err.message, post.id);
      console.error(`[scheduler] Failed post #${post.id}:`, err.message);
    }
  }
});

/* ------------------------------------------
   START
------------------------------------------ */
app.listen(PORT, () => {
  console.log(`\n✦ Wright Click Social Server running on http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  console.log(`  Leads API:    http://localhost:${PORT}/api/leads`);
  console.log(`  Posts API:    http://localhost:${PORT}/api/posts\n`);
});

module.exports = { app, db };
