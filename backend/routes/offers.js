const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

console.log('Offers router loaded');

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
  res.json({ message: 'Offers router is working' });
});

// POST /api/offers - Create a new offer (protected)
router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const { listing_id, offer_amount, message } = req.body;

  // Validate required fields
  if (!listing_id) {
    return res.status(400).json({ error: 'listing_id is required' });
  }
  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    // Start transaction
    await pool.query('BEGIN');

    // 1. Confirm listing exists with status = 'active' and get seller info
    const listingCheck = await pool.query(`
      SELECT l.*, h.user_id as listing_user_id 
      FROM listings l
      JOIN holdings h ON l.holding_id = h.id
      WHERE l.id = $1 AND l.status = 'active'
    `, [listing_id]);

    if (listingCheck.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Listing not found or not active' });
    }

    const listing = listingCheck.rows[0];
    
    // 2. Prevent authenticated user from making an offer on their own listing
    if (listing.listing_user_id === userId) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Cannot make offer on your own listing' 
      });
    }

    // 3. Insert into transactions
    const insertResult = await pool.query(`
      INSERT INTO transactions (
        listing_id,
        buyer_id,
        seller_id,
        offer_amount,
        message,
        status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `, [
      listing_id,
      userId,              // buyer = authenticated user
      listing.listing_user_id, // seller = listing owner
      offer_amount,
      message,
      'pending'
    ]);

    const newOffer = insertResult.rows[0];

    await pool.query('COMMIT');
    res.status(201).json(newOffer);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating offer:', error);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

// GET /api/offers/received - Get offers received by authenticated user (protected)
router.get('/received', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;

  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        l.id as listing_id,
        l.asking_price,
        l.price_type,
        l.status as listing_status,
        h.metal_type,
        h.category,
        h.name as holding_name,
        h.weight_grams,
        h.purity,
        u.username as buyer_username
      FROM transactions t
      JOIN listings l ON t.listing_id = l.id
      JOIN holdings h ON l.holding_id = h.id
      JOIN users u ON t.buyer_id = u.id
      WHERE t.seller_id = $1
      ORDER BY t.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching received offers:', error);
    res.status(500).json({ error: 'Failed to fetch received offers' });
  }
});

// GET /api/offers/sent - Get offers sent by authenticated user (protected)
router.get('/sent', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;

  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        l.id as listing_id,
        l.asking_price,
        l.price_type,
        l.status as listing_status,
        h.metal_type,
        h.category,
        h.name as holding_name,
        h.weight_grams,
        h.purity,
        u.username as seller_username
      FROM transactions t
      JOIN listings l ON t.listing_id = l.id
      JOIN holdings h ON l.holding_id = h.id
      JOIN users u ON t.seller_id = u.id
      WHERE t.buyer_id = $1
      ORDER BY t.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sent offers:', error);
    res.status(500).json({ error: 'Failed to fetch sent offers' });
  }
});

// PUT /api/offers/:id/status - Update offer status (protected)
router.put('/:id/status', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const transactionId = req.params.id;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['accepted', 'declined', 'withdrawn'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    });
  }

  try {
    // Start transaction
    await pool.query('BEGIN');

    // 1. Fetch the transaction row first
    const transactionCheck = await pool.query(`
      SELECT * FROM transactions WHERE id = $1
    `, [transactionId]);

    if (transactionCheck.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = transactionCheck.rows[0];
    const { buyer_id, seller_id, listing_id } = transaction;

    // 2. Authorization checks
    if (status === 'accepted' || status === 'declined') {
      // Only seller can accept or decline
      if (seller_id !== userId) {
        await pool.query('ROLLBACK');
        return res.status(403).json({ 
          error: 'Only the seller can accept or decline offers' 
        });
      }
    } else if (status === 'withdrawn') {
      // Only buyer can withdraw
      if (buyer_id !== userId) {
        await pool.query('ROLLBACK');
        return res.status(403).json({ 
          error: 'Only the buyer can withdraw offers' 
        });
      }
    }

    // 3. If status = accepted, update listing status to 'under_offer'
    if (status === 'accepted') {
      await pool.query(`
        UPDATE listings 
        SET status = 'under_offer', updated_at = NOW() 
        WHERE id = $1
      `, [listing_id]);
    }

    // 4. Update transaction status
    const updateResult = await pool.query(`
      UPDATE transactions 
      SET status = $1, updated_at = NOW() 
      WHERE id = $2
      RETURNING *
    `, [status, transactionId]);

    const updatedTransaction = updateResult.rows[0];

    await pool.query('COMMIT');
    res.json(updatedTransaction);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating offer status:', error);
    res.status(500).json({ error: 'Failed to update offer status' });
  }
});

module.exports = router;