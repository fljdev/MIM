const express = require('express');
const router = express.Router();

module.exports = function (pool) {
  // GET /api/holdings — list all holdings for a user
  router.get('/', async (req, res) => {
    try {
      const { user_id } = req.query;
      if (!user_id) return res.status(400).json({ error: 'user_id is required' });

      const result = await pool.query(
        'SELECT * FROM holdings WHERE user_id = $1 ORDER BY created_at DESC',
        [user_id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching holdings:', err);
      res.status(500).json({ error: 'Failed to fetch holdings' });
    }
  });

  // GET /api/holdings/:id — single holding detail
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM holdings WHERE id = $1', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Holding not found' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching holding:', err);
      res.status(500).json({ error: 'Failed to fetch holding' });
    }
  });

  // POST /api/holdings — create a new holding
  router.post('/', async (req, res) => {
    try {
      const { user_id, metal_type, category, name, quantity, weight_grams, purity, purchase_price, purchase_date, graded, grade_cert, notes, subcategory } = req.body;

      if (!user_id || !metal_type || !category || !name || !weight_grams || !purity) {
        return res.status(400).json({ error: 'Required fields missing' });
      }

      const result = await pool.query(
        `INSERT INTO holdings (user_id, metal_type, category, name, quantity, weight_grams, purity, purchase_price, purchase_date, graded, grade_cert, notes, subcategory)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [user_id, metal_type, category, name, quantity || 1, weight_grams, purity, purchase_price || null, purchase_date || null, graded || false, grade_cert || null, notes || null, subcategory || 'bullion']
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating holding:', err);
      res.status(500).json({ error: 'Failed to create holding' });
    }
  });

  // PUT /api/holdings/:id — update a holding
  router.put('/:id', async (req, res) => {
    try {
      const fields = ['metal_type', 'category', 'name', 'quantity', 'weight_grams', 'purity', 'purchase_price', 'purchase_date', 'graded', 'grade_cert', 'notes', 'is_listed', 'subcategory'];
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

      sets.push(`updated_at = NOW()`);
      values.push(req.params.id);

      const result = await pool.query(
        `UPDATE holdings SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );

      if (result.rows.length === 0) return res.status(404).json({ error: 'Holding not found' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating holding:', err);
      res.status(500).json({ error: 'Failed to update holding' });
    }
  });

  // DELETE /api/holdings/:id
  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query('DELETE FROM holdings WHERE id = $1 RETURNING id', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Holding not found' });
      res.json({ message: 'Holding deleted', id: result.rows[0].id });
    } catch (err) {
      console.error('Error deleting holding:', err);
      res.status(500).json({ error: 'Failed to delete holding' });
    }
  });

  return router;
};
