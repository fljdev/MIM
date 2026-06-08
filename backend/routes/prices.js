const express = require('express');
const router = express.Router();

module.exports = function (pool) {
  // GET /api/prices/spot — get latest spot prices for a metal
  router.get('/spot', async (req, res) => {
    try {
      const { metal } = req.query;

      if (metal) {
        const result = await pool.query(
          'SELECT * FROM spot_price_history WHERE metal_type = $1 ORDER BY recorded_at DESC LIMIT 1',
          [metal]
        );
        return res.json(result.rows[0] || null);
      }

      // Return latest for all metals
      const result = await pool.query(
        `SELECT DISTINCT ON (metal_type) metal_type, price_usd, price_eur, recorded_at
         FROM spot_price_history
         ORDER BY metal_type, recorded_at DESC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching spot prices:', err);
      res.status(500).json({ error: 'Failed to fetch spot prices' });
    }
  });

  // GET /api/prices/valuation — get valuation history for a user
  router.get('/valuation', async (req, res) => {
    try {
      const { user_id } = req.query;
      if (!user_id) return res.status(400).json({ error: 'user_id is required' });

      const result = await pool.query(
        'SELECT * FROM valuation_history WHERE user_id = $1 ORDER BY calculated_at DESC LIMIT 30',
        [user_id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching valuation history:', err);
      res.status(500).json({ error: 'Failed to fetch valuation history' });
    }
  });

  // POST /api/prices/valuation — save a valuation snapshot
  router.post('/valuation', async (req, res) => {
    try {
      const { user_id, total_value_eur, breakdown } = req.body;

      if (!user_id || total_value_eur === undefined) {
        return res.status(400).json({ error: 'Required fields missing' });
      }

      const result = await pool.query(
        `INSERT INTO valuation_history (user_id, total_value_eur, breakdown)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [user_id, total_value_eur, breakdown ? JSON.stringify(breakdown) : null]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error saving valuation:', err);
      res.status(500).json({ error: 'Failed to save valuation' });
    }
  });

  return router;
};
