const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

console.log('Holdings router loaded');

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
  res.json({ message: 'Holdings router is working' });
});

// GET /api/holdings - Get all holdings for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;

  try {
    const result = await pool.query(`
      SELECT 
        h.id,h.user_id,h.metal_type,h.category,h.subcategory,h.name,h.quantity,h.weight_grams,h.purity,h.purchase_price,h.purchase_date,h.graded,h.grade_cert,h.notes,h.is_listed,h.images,h.in_gallery,h.created_at,h.updated_at,
        l.id as listing_id,
        l.asking_price,
        l.price_type,
        l.status as listing_status
      FROM holdings h
      LEFT JOIN listings l ON l.holding_id = h.id AND l.status = 'active'
      WHERE h.user_id = $1
      ORDER BY h.created_at DESC
    `, [userId]);

    // Transform result to include listing id if is_listed = true
    const holdings = result.rows.map(row => {
      const holding = {
        id: row.id,
        user_id: row.user_id,
        metal_type: row.metal_type,
        category: row.category,
        subcategory: row.subcategory,
        name: row.name,
        quantity: row.quantity,
        weight_grams: row.weight_grams,
        purity: row.purity,
        purchase_price: row.purchase_price,
        purchase_date: row.purchase_date,
        graded: row.graded,
        grade_cert: row.grade_cert,
        notes: row.notes,
        images: row.images || [],
        is_listed: row.is_listed,
        in_gallery: row.in_gallery || false,
        created_at: row.created_at,
        updated_at: row.updated_at
      };

      // Include listing id if is_listed = true and listing exists
      if (row.is_listed && row.listing_id) {
        holding.listing_id = row.listing_id;
        holding.asking_price = row.asking_price;
        holding.price_type = row.price_type;
        holding.listing_status = row.listing_status;
      }

      return holding;
    });

    res.json(holdings);
  } catch (error) {
    console.error('Error fetching holdings:', error);
    res.status(500).json({ error: 'Failed to fetch holdings' });
  }
});

// POST /api/holdings - Create a new holding
router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const {
    metal_type,
    category,
    name,
    quantity,
    weight_grams,
    purity,
    purchase_price,
    purchase_date,
    graded,
    grade_cert,
    notes
  } = req.body;

  // Validate required fields
  const requiredFields = ['metal_type', 'category', 'name', 'weight_grams', 'purity'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({ 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    });
  }

  // Validate metal_type enum
  const validMetalTypes = ['gold', 'silver', 'platinum', 'palladium'];
  if (!validMetalTypes.includes(metal_type)) {
    return res.status(400).json({ 
      error: `Invalid metal_type. Must be one of: ${validMetalTypes.join(', ')}` 
    });
  }

  // Validate category enum
  const validCategories = ['sovereign', 'coin', 'bar', 'round', 'junk', 'jewellery', 'flatware', 'other'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ 
      error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
    });
  }

  try {
    const result = await pool.query(`
      INSERT INTO holdings (
        user_id, metal_type, category, name, quantity, weight_grams, purity,
        purchase_price, purchase_date, graded, grade_cert, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      userId,
      metal_type,
      category,
      name,
      quantity || 1,
      weight_grams,
      purity,
      purchase_price,
      purchase_date,
      graded || false,
      grade_cert,
      notes
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating holding:', error);
    res.status(500).json({ error: 'Failed to create holding' });
  }
});

// PUT /api/holdings/:id - Update a holding
router.put('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const holdingId = req.params.id;
  const {
    metal_type,
    category,
    name,
    quantity,
    weight_grams,
    purity,
    purchase_price,
    purchase_date,
    graded,
    grade_cert,
    notes,
    is_listed
  } = req.body;

  // Validate metal_type if provided
  if (metal_type) {
    const validMetalTypes = ['gold', 'silver', 'platinum', 'palladium'];
    if (!validMetalTypes.includes(metal_type)) {
      return res.status(400).json({ 
        error: `Invalid metal_type. Must be one of: ${validMetalTypes.join(', ')}` 
      });
    }
  }

  // Validate category if provided
  if (category) {
    const validCategories = ['sovereign', 'coin', 'bar', 'round', 'junk', 'jewellery', 'flatware', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      });
    }
  }

  try {
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (metal_type !== undefined) {
      updateFields.push(`metal_type = $${paramCount}`);
      updateValues.push(metal_type);
      paramCount++;
    }

    if (category !== undefined) {
      updateFields.push(`category = $${paramCount}`);
      updateValues.push(category);
      paramCount++;
    }

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
      paramCount++;
    }

    if (quantity !== undefined) {
      updateFields.push(`quantity = $${paramCount}`);
      updateValues.push(quantity);
      paramCount++;
    }

    if (weight_grams !== undefined) {
      updateFields.push(`weight_grams = $${paramCount}`);
      updateValues.push(weight_grams);
      paramCount++;
    }

    if (purity !== undefined) {
      updateFields.push(`purity = $${paramCount}`);
      updateValues.push(purity);
      paramCount++;
    }

    if (purchase_price !== undefined) {
      updateFields.push(`purchase_price = $${paramCount}`);
      updateValues.push(purchase_price);
      paramCount++;
    }

    if (purchase_date !== undefined) {
      updateFields.push(`purchase_date = $${paramCount}`);
      updateValues.push(purchase_date);
      paramCount++;
    }

    if (graded !== undefined) {
      updateFields.push(`graded = $${paramCount}`);
      updateValues.push(graded);
      paramCount++;
    }

    if (grade_cert !== undefined) {
      updateFields.push(`grade_cert = $${paramCount}`);
      updateValues.push(grade_cert);
      paramCount++;
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount}`);
      updateValues.push(notes);
      paramCount++;
    }

    if (is_listed !== undefined) {
      updateFields.push(`is_listed = $${paramCount}`);
      updateValues.push(is_listed);
      paramCount++;
    }

    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add holdingId and userId as the last parameters
    updateValues.push(holdingId);
    updateValues.push(userId);

    const updateQuery = `
      UPDATE holdings 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Holding not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating holding:', error);
    res.status(500).json({ error: 'Failed to update holding' });
  }
});

// DELETE /api/holdings/:id - Delete a holding
router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const holdingId = req.params.id;

  try {
    // Check if holding exists and belongs to user
    const holdingCheck = await pool.query(
      'SELECT is_listed FROM holdings WHERE id = $1 AND user_id = $2',
      [holdingId, userId]
    );

    if (holdingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Holding not found or unauthorized' });
    }

    // If holding is listed, delete the corresponding listing first
    if (holdingCheck.rows[0].is_listed) {
      await pool.query(
        'DELETE FROM listings WHERE holding_id = $1 AND user_id = $2',
        [holdingId, userId]
      );
    }

    // Delete the holding
    await pool.query(
      'DELETE FROM holdings WHERE id = $1 AND user_id = $2',
      [holdingId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting holding:', error);
    res.status(500).json({ error: 'Failed to delete holding' });
  }
});

// PATCH /api/holdings/:id/gallery - Add a holding to the gallery
router.patch('/:id/gallery', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const holdingId = req.params.id;

  try {
    const result = await pool.query(
      `UPDATE holdings SET in_gallery = true, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [holdingId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Holding not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding holding to gallery:', error);
    res.status(500).json({ error: 'Failed to add holding to gallery' });
  }
});

// PATCH /api/holdings/:id/ungallery - Remove a holding from the gallery
router.patch('/:id/ungallery', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const holdingId = req.params.id;

  try {
    const result = await pool.query(
      `UPDATE holdings SET in_gallery = false, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [holdingId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Holding not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error removing holding from gallery:', error);
    res.status(500).json({ error: 'Failed to remove holding from gallery' });
  }
});

module.exports = router;
