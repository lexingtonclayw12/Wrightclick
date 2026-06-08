/* Config API — save/load API credentials */
const express = require('express');
const router = express.Router();

function setConfig(db, key, value) {
  db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run(key, value);
}

// POST /api/config/meta
router.post('/meta', (req, res) => {
  const db = req.app.locals.db;
  const { token, pageId, igId } = req.body;
  if (!token || !pageId) return res.status(400).json({ error: 'token and pageId required' });
  setConfig(db, 'META_PAGE_ACCESS_TOKEN', token);
  setConfig(db, 'META_PAGE_ID', pageId);
  if (igId) setConfig(db, 'META_IG_USER_ID', igId);
  res.json({ ok: true });
});

// POST /api/config/tiktok
router.post('/tiktok', (req, res) => {
  const db = req.app.locals.db;
  const { token, clientKey, clientSecret } = req.body;
  if (!token) return res.status(400).json({ error: 'access token required' });
  setConfig(db, 'TIKTOK_ACCESS_TOKEN', token);
  if (clientKey) setConfig(db, 'TIKTOK_CLIENT_KEY', clientKey);
  if (clientSecret) setConfig(db, 'TIKTOK_CLIENT_SECRET', clientSecret);
  res.json({ ok: true });
});

// GET /api/config/status — check what's configured (never returns secrets)
router.get('/status', (req, res) => {
  const db = req.app.locals.db;
  const hasKey = (k) => !!db.prepare('SELECT value FROM config WHERE key=?').get(k);
  res.json({
    meta: hasKey('META_PAGE_ACCESS_TOKEN') && hasKey('META_PAGE_ID'),
    instagram: hasKey('META_IG_USER_ID'),
    tiktok: hasKey('TIKTOK_ACCESS_TOKEN')
  });
});

module.exports = router;
