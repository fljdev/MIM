const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

console.log('Cash router loaded');

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
  res.json({ message: 'Cash router is working' });
});

// GET /api/cash - Get all cash holdings for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;

  try {
    const result = await pool.query(`
      SELECT * FROM cash_holdings
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cash holdings:', error);
    res.status(500).json({ error: 'Failed to fetch cash holdings' });
  }
});

// POST /api/cash - Create a new cash holding
router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const {
    label,
    type,
    currency,
    amount,
    institution,
    notes
  } = req.body;

  // Validate required fields
  if (!label || !type || amount === undefined || amount === null) {
    return res.status(400).json({
      error: 'Missing required fields: label, type, and amount are required'
    });
  }

  // Validate type enum
  const validTypes = ['bank_account', 'cash_physical', 'savings', 'overdraft', 'loan', 'other'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      error: `Invalid type. Must be one of: ${validTypes.join(', ')}`
    });
  }

  try {
    const result = await pool.query(`
      INSERT INTO cash_holdings (
        user_id, label, type, currency, amount, institution, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      userId,
      label,
      type,
      currency || 'EUR',
      amount,
      institution,
      notes
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating cash holding:', error);
    res.status(500).json({ error: 'Failed to create cash holding' });
  }
});

// PUT /api/cash/:id - Update a cash holding
router.put('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const cashId = req.params.id;
  const {
    label,
    type,
    currency,
    amount,
    institution,
    notes
  } = req.body;

  // Validate type if provided
  if (type) {
    const validTypes = ['bank_account', 'cash_physical', 'savings', 'overdraft', 'loan', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      });
    }
  }

  try {
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (label !== undefined) {
      updateFields.push(`label = $${paramCount}`);
      updateValues.push(label);
      paramCount++;
    }

    if (type !== undefined) {
      updateFields.push(`type = $${paramCount}`);
      updateValues.push(type);
      paramCount++;
    }

    if (currency !== undefined) {
      updateFields.push(`currency = $${paramCount}`);
      updateValues.push(currency);
      paramCount++;
    }

    if (amount !== undefined) {
      updateFields.push(`amount = $${paramCount}`);
      updateValues.push(amount);
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

    // Add cashId and userId as the last parameters
    updateValues.push(cashId);
    updateValues.push(userId);

    const updateQuery = `
      UPDATE cash_holdings 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cash holding not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating cash holding:', error);
    res.status(500).json({ error: 'Failed to update cash holding' });
  }
});

// DELETE /api/cash/:id - Delete a cash holding
router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const cashId = req.params.id;

  try {
    // Check if cash holding exists and belongs to user
    const cashCheck = await pool.query(
      'SELECT id FROM cash_holdings WHERE id = $1 AND user_id = $2',
      [cashId, userId]
    );

    if (cashCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cash holding not found or unauthorized' });
    }

    // Delete the cash holding
    await pool.query(
      'DELETE FROM cash_holdings WHERE id = $1 AND user_id = $2',
      [cashId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting cash holding:', error);
    res.status(500).json({ error: 'Failed to delete cash holding' });
  }
});

module.exports = router;
