const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

console.log('Listings router loaded');

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
  res.json({ message: 'Listings router is working' });
});

// POST /api/listings - Create a new listing (protected)
router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const {
    holding_id,
    asking_price,
    price_type,
    spot_premium,
    location_county,
    postage_offered,
    visible_to
  } = req.body;

  // Validate required field
  if (!holding_id) {
    return res.status(400).json({ error: 'holding_id is required' });
  }

  // Validate price_type enum
  const validPriceTypes = ['fixed', 'spot_plus', 'offers'];
  if (price_type && !validPriceTypes.includes(price_type)) {
    return res.status(400).json({ 
      error: `Invalid price_type. Must be one of: ${validPriceTypes.join(', ')}` 
    });
  }

  // Validate visible_to enum if provided
  const validVisibleTo = ['all', 'verified_only'];
  if (visible_to && !validVisibleTo.includes(visible_to)) {
    return res.status(400).json({ 
      error: `Invalid visible_to. Must be one of: ${validVisibleTo.join(', ')}` 
    });
  }

  try {
    // Start transaction
    await pool.query('BEGIN');

    // 1. Confirm the holding exists and belongs to the authenticated user
    const holdingCheck = await pool.query(
      'SELECT id, is_listed FROM holdings WHERE id = $1 AND user_id = $2',
      [holding_id, userId]
    );

    if (holdingCheck.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(403).json({ error: 'Holding not found or does not belong to user' });
    }

    const holding = holdingCheck.rows[0];
    
    // 2. Check if holding is already listed
    if (holding.is_listed) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Holding is already listed' });
    }

    // 3. Insert into listings
    const listingResult = await pool.query(`
      INSERT INTO listings (
        holding_id,
        user_id,
        asking_price,
        price_type,
        spot_premium,
        location_county,
        postage_offered,
        status,
        visible_to
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      holding_id,
      userId,
      asking_price,
      price_type || 'fixed',
      spot_premium,
      location_county,
      postage_offered || false,
      'active',
      visible_to || 'all'
    ]);

    const newListing = listingResult.rows[0];

    // 4. Update holdings set is_listed = true
    await pool.query(
      'UPDATE holdings SET is_listed = true, updated_at = NOW() WHERE id = $1',
      [holding_id]
    );

    // 5. Get the joined data with holding details
    const joinedResult = await pool.query(`
      SELECT 
        l.*,
        h.metal_type,
        h.category,
        h.name as holding_name,
        h.quantity,
        h.weight_grams,
        h.purity,
        h.graded,
        h.grade_cert,
        h.notes as holding_notes
      FROM listings l
      JOIN holdings h ON l.holding_id = h.id
      WHERE l.id = $1
    `, [newListing.id]);

    await pool.query('COMMIT');

    res.status(201).json(joinedResult.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// PUT /api/listings/:id - Update a listing (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const listingId = req.params.id;
  const {
    asking_price,
    price_type,
    spot_premium,
    location_county,
    postage_offered,
    visible_to
  } = req.body;

  // Validate price_type enum if provided
  const validPriceTypes = ['fixed', 'spot_plus', 'offers'];
  if (price_type && !validPriceTypes.includes(price_type)) {
    return res.status(400).json({ 
      error: `Invalid price_type. Must be one of: ${validPriceTypes.join(', ')}` 
    });
  }

  // Validate visible_to enum if provided
  const validVisibleTo = ['all', 'verified_only'];
  if (visible_to && !validVisibleTo.includes(visible_to)) {
    return res.status(400).json({ 
      error: `Invalid visible_to. Must be one of: ${validVisibleTo.join(', ')}` 
    });
  }

  try {
    // Start transaction
    await pool.query('BEGIN');

    // 1. Confirm listing belongs to authenticated user
    const listingCheck = await pool.query(
      'SELECT * FROM listings WHERE id = $1 AND user_id = $2',
      [listingId, userId]
    );

    if (listingCheck.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = listingCheck.rows[0];

    // 2. Only allow editing active listings
    if (listing.status !== 'active') {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Only active listings can be edited' });
    }

    // 3. Update listing fields (listing-only — no holdings fields touched)
    const updateResult = await pool.query(`
      UPDATE listings SET
        asking_price = COALESCE($1, asking_price),
        price_type = COALESCE($2, price_type),
        spot_premium = $3,
        location_county = COALESCE($4, location_county),
        postage_offered = COALESCE($5, postage_offered),
        visible_to = COALESCE($6, visible_to),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [
      asking_price ?? listing.asking_price,
      price_type || listing.price_type,
      spot_premium !== undefined ? spot_premium : listing.spot_premium,
      location_county ?? listing.location_county,
      postage_offered !== undefined ? postage_offered : listing.postage_offered,
      visible_to || listing.visible_to,
      listingId
    ]);

    const updatedListing = updateResult.rows[0];

    // 4. Get the joined data with holding details
    const joinedResult = await pool.query(`
      SELECT 
        l.*,
        h.metal_type,
        h.category,
        h.name as holding_name,
        h.quantity,
        h.weight_grams,
        h.purity,
        h.graded,
        h.grade_cert,
        h.notes as holding_notes
      FROM listings l
      JOIN holdings h ON l.holding_id = h.id
      WHERE l.id = $1
    `, [updatedListing.id]);

    await pool.query('COMMIT');

    res.json(joinedResult.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating listing:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// DELETE /api/listings/:id - Withdraw a listing (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const listingId = req.params.id;

  try {
    // Start transaction
    await pool.query('BEGIN');

    // 1. Confirm listing belongs to authenticated user and get holding_id
    const listingCheck = await pool.query(
      'SELECT id, holding_id, status FROM listings WHERE id = $1 AND user_id = $2',
      [listingId, userId]
    );

    if (listingCheck.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Listing not found or does not belong to user' });
    }

    const listing = listingCheck.rows[0];

    // 2. Belt-and-braces: reject if listing status is 'under_offer' (state machine guard)
    if (listing.status === 'under_offer') {
      await pool.query('ROLLBACK');
      return res.status(409).json({ 
        error: 'Cannot delete listing that is under offer. Decline or complete the active offer first.' 
      });
    }

    // 3. Also check for pending/accepted transaction records
    const activeTxCheck = await pool.query(`
      SELECT id FROM transactions 
      WHERE listing_id = $1 AND status IN ('pending', 'accepted')
      LIMIT 1
    `, [listingId]);

    if (activeTxCheck.rows.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(409).json({ 
        error: 'Cannot delete listing with active offers. Decline or resolve all pending offers first.' 
      });
    }

    // 4. Update listings set status = 'withdrawn'
    await pool.query(
      "UPDATE listings SET status = 'withdrawn', updated_at = NOW() WHERE id = $1",
      [listingId]
    );

    // 5. Update holdings set is_listed = false
    await pool.query(
      'UPDATE holdings SET is_listed = false, updated_at = NOW() WHERE id = $1',
      [listing.holding_id]
    );

    await pool.query('COMMIT');

    res.json({ success: true });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error withdrawing listing:', error);
    res.status(500).json({ error: 'Failed to withdraw listing' });
  }
});

// GET /api/listings/marketplace - Get active listings (public)
router.get('/marketplace', async (req, res) => {
  const pool = req.app.locals.pool;
  
  // Extract query parameters for filtering
  const { metal_type, category, location_county } = req.query;
  
  try {
    // Build the base query
    let query = `
      SELECT 
        l.*,
        h.metal_type,
        h.category,
        h.name as holding_name,
        h.quantity,
        h.weight_grams,
        h.purity,
        h.graded,
        h.grade_cert,
        u.id as user_id,
        u.name
      FROM listings l
      JOIN holdings h ON l.holding_id = h.id
      JOIN users u ON l.user_id = u.id
      WHERE l.status = 'active'
    `;

    const queryParams = [];
    let paramCount = 1;

    // Apply visibility filter: exclude 'verified_only' if no Authorization header
    if (!req.headers.authorization) {
      query += ` AND l.visible_to = 'all'`;
    }

    // Apply metal_type filter if provided
    if (metal_type) {
      query += ` AND h.metal_type = $${paramCount}`;
      queryParams.push(metal_type);
      paramCount++;
    }

    // Apply category filter if provided
    if (category) {
      query += ` AND h.category = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }

    // Apply location_county filter if provided
    if (location_county) {
      query += ` AND l.location_county = $${paramCount}`;
      queryParams.push(location_county);
      paramCount++;
    }

    query += ` ORDER BY l.created_at DESC`;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching marketplace listings:', error);
    res.status(500).json({ error: 'Failed to fetch marketplace listings' });
  }
});

// GET /api/listings/mine - Get all listings for authenticated user (protected)
router.get('/mine', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;

  try {
    const result = await pool.query(`
      SELECT 
        l.*,
        h.metal_type,
        h.category,
        h.name as holding_name,
        h.quantity,
        h.weight_grams,
        h.purity,
        h.graded,
        h.grade_cert,
        h.notes as holding_notes
      FROM listings l
      JOIN holdings h ON l.holding_id = h.id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({ error: 'Failed to fetch user listings' });
  }
});

module.exports = router;