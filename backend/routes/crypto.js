const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const https = require('https');

console.log('Crypto router loaded');

const JWT_SECRET = process.env.JWT_SECRET || 'mimapp-dev-secret-2025';

// Authentication middleware (same as other routes)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Add user info to request
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Crypto router is working' });
});

// GET /api/crypto/prices - Fetch live EUR prices from CoinGecko (public, no auth)
router.get('/prices', (req, res) => {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,cardano,polkadot&vs_currencies=eur';

  https.get(url, { headers: { 'User-Agent': 'MiM-App/1.0 (mim.town)' } }, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('CoinGecko response:', JSON.stringify(data));
        res.json(json);
      } catch (parseError) {
        console.error('Error parsing CoinGecko response:', parseError);
        res.status(502).json({ error: 'Failed to parse price data' });
      }
    });
  }).on('error', (error) => {
    console.error('Error fetching prices from CoinGecko:', error);
    res.status(502).json({ error: 'Failed to fetch prices' });
  });
});

// GET /api/crypto - Get all crypto holdings for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;

  try {
    const result = await pool.query(`
      SELECT * FROM crypto_holdings
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching crypto holdings:', error);
    res.status(500).json({ error: 'Failed to fetch crypto holdings' });
  }
});

// POST /api/crypto - Create a new crypto holding
router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const {
    coin_id,
    coin_symbol,
    coin_name,
    quantity,
    purchase_price_eur,
    purchase_date,
    wallet_type,
    institution,
    notes
  } = req.body;

  // Validate required fields
  const requiredFields = ['coin_id', 'coin_symbol', 'coin_name', 'quantity'];
  const missingFields = requiredFields.filter(field => !req.body[field] && req.body[field] !== 0);
  if (missingFields.length > 0) {
    return res.status(400).json({ 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    });
  }

  try {
    const result = await pool.query(`
      INSERT INTO crypto_holdings (
        user_id, coin_id, coin_symbol, coin_name, quantity,
        purchase_price_eur, purchase_date, wallet_type, institution, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      userId,
      coin_id,
      coin_symbol,
      coin_name,
      quantity,
      purchase_price_eur,
      purchase_date,
      wallet_type,
      institution,
      notes
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating crypto holding:', error);
    res.status(500).json({ error: 'Failed to create crypto holding' });
  }
});

// PUT /api/crypto/:id - Update a crypto holding
router.put('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const cryptoId = req.params.id;
  const {
    coin_id,
    coin_symbol,
    coin_name,
    quantity,
    purchase_price_eur,
    purchase_date,
    wallet_type,
    institution,
    notes
  } = req.body;

  try {
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (coin_id !== undefined) {
      updateFields.push(`coin_id = $${paramCount}`);
      updateValues.push(coin_id);
      paramCount++;
    }

    if (coin_symbol !== undefined) {
      updateFields.push(`coin_symbol = $${paramCount}`);
      updateValues.push(coin_symbol);
      paramCount++;
    }

    if (coin_name !== undefined) {
      updateFields.push(`coin_name = $${paramCount}`);
      updateValues.push(coin_name);
      paramCount++;
    }

    if (quantity !== undefined) {
      updateFields.push(`quantity = $${paramCount}`);
      updateValues.push(quantity);
      paramCount++;
    }

    if (purchase_price_eur !== undefined) {
      updateFields.push(`purchase_price_eur = $${paramCount}`);
      updateValues.push(purchase_price_eur);
      paramCount++;
    }

    if (purchase_date !== undefined) {
      updateFields.push(`purchase_date = $${paramCount}`);
      updateValues.push(purchase_date);
      paramCount++;
    }

    if (wallet_type !== undefined) {
      updateFields.push(`wallet_type = $${paramCount}`);
      updateValues.push(wallet_type);
      paramCount++;
    }

    if (institution !== undefined) {
      updateFields.push(`institution = $${paramCount}`);
      updateValues.push(institution);
      paramCount++;
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount}`);
      updateValues.push(notes);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add cryptoId and userId as the last parameters
    updateValues.push(cryptoId);
    updateValues.push(userId);

    const updateQuery = `
      UPDATE crypto_holdings 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Crypto holding not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating crypto holding:', error);
    res.status(500).json({ error: 'Failed to update crypto holding' });
  }
});

// DELETE /api/crypto/:id - Delete a crypto holding
router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const cryptoId = req.params.id;

  try {
    // Check if crypto holding exists and belongs to user
    const cryptoCheck = await pool.query(
      'SELECT id FROM crypto_holdings WHERE id = $1 AND user_id = $2',
      [cryptoId, userId]
    );

    if (cryptoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Crypto holding not found or unauthorized' });
    }

    // Delete the crypto holding
    await pool.query(
      'DELETE FROM crypto_holdings WHERE id = $1 AND user_id = $2',
      [cryptoId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting crypto holding:', error);
    res.status(500).json({ error: 'Failed to delete crypto holding' });
  }
});

module.exports = router;
