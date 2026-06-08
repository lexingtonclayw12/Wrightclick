/* Leads API — stores diagnostic form submissions */
const express = require('express');
const router = express.Router();

// GET /api/leads
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  res.json(leads);
});

// POST /api/leads
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { first_name, last_name, email, website_url, business_type, challenge } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const stmt = db.prepare(`
      INSERT INTO leads (first_name, last_name, email, website_url, business_type, challenge)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(first_name || '', last_name || '', email, website_url || '', business_type || '', challenge || '');

    console.log(`[lead] New diagnostic request: ${email} — ${website_url}`);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Lead saved' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email already submitted' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/leads/:id — update status
router.patch('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { status, notes } = req.body;
  db.prepare('UPDATE leads SET status=?, notes=? WHERE id=?').run(status, notes || '', req.params.id);
  res.json({ ok: true });
});

// DELETE /api/leads/:id
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.prepare('DELETE FROM leads WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
