const express = require('express');
const router = express.Router();

module.exports = function (pool) {
  // GET /api/cash — list all cash holdings for a user
  router.get('/', async (req, res) => {
    try {
      const { user_id } = req.query;
      if (!user_id) return res.status(400).json({ error: 'user_id is required' });

      const result = await pool.query(
        'SELECT * FROM cash_holdings WHERE user_id = $1 ORDER BY created_at DESC',
        [user_id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching cash holdings:', err);
      res.status(500).json({ error: 'Failed to fetch cash holdings' });
    }
  });

  // GET /api/cash/:id
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM cash_holdings WHERE id = $1', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Cash holding not found' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching cash holding:', err);
      res.status(500).json({ error: 'Failed to fetch cash holding' });
    }
  });

  // POST /api/cash
  router.post('/', async (req, res) => {
    try {
      const { user_id, label, type, currency, amount, institution, notes } = req.body;

      if (!user_id || !label || !type || amount === undefined) {
        return res.status(400).json({ error: 'Required fields missing' });
      }

      const result = await pool.query(
        `INSERT INTO cash_holdings (user_id, label, type, currency, amount, institution, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [user_id, label, type, currency || 'EUR', amount, institution || null, notes || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating cash holding:', err);
      res.status(500).json({ error: 'Failed to create cash holding' });
    }
  });

  // PUT /api/cash/:id
  router.put('/:id', async (req, res) => {
    try {
      const fields = ['label', 'type', 'currency', 'amount', 'institution', 'notes'];
      const sets = [];
      const values = [];
      let idx = 1;

      for (const field of fields) {
        if (req.body[field] !== undefined) {
          sets.push(`${field} = $${idx++}`);
          values.push(req.body[field]);
        }
      }

      if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

      values.push(req.params.id);
      const result = await pool.query(
        `UPDATE cash_holdings SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );

      if (result.rows.length === 0) return res.status(404).json({ error: 'Cash holding not found' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating cash holding:', err);
      res.status(500).json({ error: 'Failed to update cash holding' });
    }
  });

  // DELETE /api/cash/:id
  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query('DELETE FROM cash_holdings WHERE id = $1 RETURNING id', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Cash holding not found' });
      res.json({ message: 'Cash holding deleted', id: result.rows[0].id });
    } catch (err) {
      console.error('Error deleting cash holding:', err);
      res.status(500).json({ error: 'Failed to delete cash holding' });
    }
  });

  return router;
};
