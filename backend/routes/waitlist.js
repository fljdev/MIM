const express = require('express');
const router = express.Router();

// POST /api/waitlist - Add email to waitlist
router.post('/', async (req, res) => {
  const pool = req.app.locals.pool;
  const { email } = req.body;

  // Basic validation
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO waitlist (email) VALUES ($1) ON CONFLICT (email) DO NOTHING RETURNING *',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "You're already on the list!" });
    }

    res.status(201).json({ message: "Thanks! We'll notify you when we launch." });
  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// GET /api/waitlist - Get all waitlist emails
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const result = await pool.query('SELECT * FROM waitlist ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Waitlist fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch waitlist' });
  }
});

module.exports = router;