const express = require('express');
const router = express.Router();

module.exports = function (pool) {
  // GET /api/crypto — list all crypto holdings for a user
  router.get('/', async (req, res) => {
    try {
      const { user_id } = req.query;
      if (!user_id) return res.status(400).json({ error: 'user_id is required' });

      const result = await pool.query(
        'SELECT * FROM crypto_holdings WHERE user_id = $1 ORDER BY created_at DESC',
        [user_id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching crypto holdings:', err);
      res.status(500).json({ error: 'Failed to fetch crypto holdings' });
    }
  });

  // GET /api/crypto/:id
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM crypto_holdings WHERE id = $1', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Crypto holding not found' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching crypto holding:', err);
      res.status(500).json({ error: 'Failed to fetch crypto holding' });
    }
  });

  // POST /api/crypto
  router.post('/', async (req, res) => {
    try {
      const { user_id, coin_id, coin_symbol, coin_name, quantity, purchase_price_eur, purchase_date, wallet_type, institution, notes, unit } = req.body;

      if (!user_id || !coin_id || !coin_symbol || !coin_name || quantity === undefined) {
        return res.status(400).json({ error: 'Required fields missing' });
      }

      const result = await pool.query(
        `INSERT INTO crypto_holdings (user_id, coin_id, coin_symbol, coin_name, quantity, purchase_price_eur, purchase_date, wallet_type, institution, notes, unit)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [user_id, coin_id, coin_symbol, coin_name, quantity, purchase_price_eur || null, purchase_date || null, wallet_type || null, institution || null, notes || null, unit || 'BTC']
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating crypto holding:', err);
      res.status(500).json({ error: 'Failed to create crypto holding' });
    }
  });

  // PUT /api/crypto/:id
  router.put('/:id', async (req, res) => {
    try {
      const fields = ['coin_id', 'coin_symbol', 'coin_name', 'quantity', 'purchase_price_eur', 'purchase_date', 'wallet_type', 'institution', 'notes', 'unit'];
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
        `UPDATE crypto_holdings SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );

      if (result.rows.length === 0) return res.status(404).json({ error: 'Crypto holding not found' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating crypto holding:', err);
      res.status(500).json({ error: 'Failed to update crypto holding' });
    }
  });

  // DELETE /api/crypto/:id
  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query('DELETE FROM crypto_holdings WHERE id = $1 RETURNING id', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Crypto holding not found' });
      res.json({ message: 'Crypto holding deleted', id: result.rows[0].id });
    } catch (err) {
      console.error('Error deleting crypto holding:', err);
      res.status(500).json({ error: 'Failed to delete crypto holding' });
    }
  });

  return router;
};
