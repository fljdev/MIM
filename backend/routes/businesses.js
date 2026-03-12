const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

console.log('Businesses router loaded');

const JWT_SECRET = process.env.JWT_SECRET || 'mimapp-dev-secret-2025';

// Authentication middleware
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

// Authorization middleware for business users or admin
const authorizeBusiness = (req, res, next) => {
  const user = req.user;
  
  if (user.role === 'admin' || user.role === 'business') {
    next();
  } else {
    return res.status(403).json({ error: 'Access denied. Business or admin role required.' });
  }
};

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Businesses router is working' });
});

// GET /api/businesses - List all businesses (public, with optional filters)
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  const { verified, business_type, search, limit = 20, offset = 0 } = req.query;

  try {
    let query = `
      SELECT 
        b.id, b.name, b.description, b.registered_number, b.website, b.phone,
        b.address, b.latitude, b.longitude, b.owner_id, b.verified, 
        b.business_type, b.created_at, b.updated_at,
        u.name as owner_name, u.email as owner_email
      FROM businesses b
      LEFT JOIN users u ON b.owner_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (verified !== undefined) {
      query += ` AND b.verified = $${paramCount}`;
      params.push(verified === 'true');
      paramCount++;
    }

    if (business_type) {
      query += ` AND b.business_type = $${paramCount}`;
      params.push(business_type);
      paramCount++;
    }

    if (search) {
      query += ` AND (
        b.name ILIKE $${paramCount} OR 
        b.description ILIKE $${paramCount} OR 
        b.address ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY b.verified DESC, b.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM businesses WHERE 1=1`;
    const countParams = [];
    paramCount = 1;

    if (verified !== undefined) {
      countQuery += ` AND verified = $${paramCount}`;
      countParams.push(verified === 'true');
      paramCount++;
    }

    if (business_type) {
      countQuery += ` AND business_type = $${paramCount}`;
      countParams.push(business_type);
      paramCount++;
    }

    if (search) {
      countQuery += ` AND (
        name ILIKE $${paramCount} OR 
        description ILIKE $${paramCount} OR 
        address ILIKE $${paramCount}
      )`;
      countParams.push(`%${search}%`);
      paramCount++;
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      businesses: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// GET /api/businesses/my/business - Get current user's business (authenticated)
router.get('/my/business', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT 
        b.id, b.name, b.description, b.registered_number, b.website, b.phone,
        b.address, b.latitude, b.longitude, b.owner_id, b.verified, 
        b.business_type, b.created_at, b.updated_at,
        u.name as owner_name, u.email as owner_email
       FROM businesses b
       LEFT JOIN users u ON b.owner_id = u.id
       WHERE b.owner_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No business profile found for this user' });
    }

    res.json({ business: result.rows[0] });

  } catch (error) {
    console.error('Error fetching user business:', error);
    res.status(500).json({ error: 'Failed to fetch business profile' });
  }
});

// GET /api/businesses/my/enquiries - Get incoming enquiries for logged-in user's business (authenticated)
router.get('/my/enquiries', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;

  try {
    // Get user's business ID
    const businessResult = await pool.query(
      'SELECT id FROM businesses WHERE owner_id = $1',
      [userId]
    );

    if (businessResult.rows.length === 0) {
      return res.status(404).json({ error: 'No business profile found' });
    }

    const businessId = businessResult.rows[0].id;

    // Get enquiries where this business is the seller
    const result = await pool.query(
      `SELECT 
        t.id,
        t.material_id,
        t.seller_id,
        t.buyer_id,
        t.quantity_exchanged,
        t.unit,
        t.status,
        t.notes,
        t.created_at,
        t.updated_at,
        m.title as material_title,
        b.name as buyer_business_name
       FROM transactions t
       JOIN materials m ON t.material_id = m.id
       JOIN businesses b ON t.buyer_id = b.id
       WHERE t.seller_id = $1 
         AND t.status = 'enquiry'
       ORDER BY t.created_at DESC`,
      [businessId]
    );

    res.json({ enquiries: result.rows });

  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
});

// GET /api/businesses/:id - Get business by ID (public)
router.get('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        b.id, b.name, b.description, b.registered_number, b.website, b.phone,
        b.address, b.latitude, b.longitude, b.owner_id, b.verified, 
        b.business_type, b.created_at, b.updated_at,
        u.name as owner_name, u.email as owner_email,
        (SELECT COUNT(*) FROM materials WHERE business_id = b.id AND condition = 'available') as available_materials_count,
        (SELECT COUNT(*) FROM transactions WHERE seller_id = b.id AND status = 'completed') as completed_transactions_count
       FROM businesses b
       LEFT JOIN users u ON b.owner_id = u.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json({ business: result.rows[0] });

  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

// POST /api/businesses - Create new business (authenticated)
router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const {
    name,
    description,
    registered_number,
    website,
    phone,
    address,
    latitude,
    longitude,
    business_type
  } = req.body;

  try {
    // Validate required fields
    if (!name || !address || !business_type) {
      return res.status(400).json({ error: 'Name, address, and business_type are required' });
    }

    // Validate business_type
    const validBusinessTypes = ['manufacturer', 'distributor', 'recycler', 'retailer', 'wholesaler', 'service', 'other'];
    if (!validBusinessTypes.includes(business_type)) {
      return res.status(400).json({ 
        error: `Invalid business_type. Must be one of: ${validBusinessTypes.join(', ')}` 
      });
    }

    // Check if user already has a business
    const existingBusiness = await pool.query(
      'SELECT id FROM businesses WHERE owner_id = $1',
      [userId]
    );

    if (existingBusiness.rows.length > 0) {
      return res.status(409).json({ 
        error: 'User already has a business profile. Use PUT to update.' 
      });
    }

    // Check if registered_number is unique (if provided)
    if (registered_number) {
      const existingRegistered = await pool.query(
        'SELECT id FROM businesses WHERE registered_number = $1',
        [registered_number]
      );

      if (existingRegistered.rows.length > 0) {
        return res.status(409).json({ 
          error: 'Business with this registered number already exists' 
        });
      }
    }

    // Create business
    const result = await pool.query(
      `INSERT INTO businesses (
        name, description, registered_number, website, phone,
        address, latitude, longitude, owner_id, business_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        name, description || null, registered_number || null, website || null, phone || null,
        address, latitude || null, longitude || null, userId, business_type
      ]
    );

    // Update user's business_profile_id and role
    await pool.query(
      'UPDATE users SET business_profile_id = $1, role = $2 WHERE id = $3',
      [result.rows[0].id, 'business', userId]
    );

    res.status(201).json({
      message: 'Business profile created successfully',
      business: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({ error: 'Failed to create business profile' });
  }
});

// PUT /api/businesses/:id - Update business (authenticated, owner only)
router.put('/:id', authenticateToken, authorizeBusiness, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const { id } = req.params;
  const {
    name,
    description,
    registered_number,
    website,
    phone,
    address,
    latitude,
    longitude,
    business_type
  } = req.body;

  try {
    // Verify user owns this business or is admin
    const ownershipCheck = await pool.query(
      'SELECT owner_id FROM businesses WHERE id = $1',
      [id]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const business = ownershipCheck.rows[0];
    
    if (req.user.role !== 'admin' && business.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only update your own business.' });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
      paramCount++;
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      updateValues.push(description);
      paramCount++;
    }

    if (registered_number !== undefined) {
      // Check if new registered_number is unique (if changed)
      if (registered_number !== business.registered_number) {
        const existingRegistered = await pool.query(
          'SELECT id FROM businesses WHERE registered_number = $1 AND id != $2',
          [registered_number, id]
        );

        if (existingRegistered.rows.length > 0) {
          return res.status(409).json({ 
            error: 'Business with this registered number already exists' 
          });
        }
      }
      updateFields.push(`registered_number = $${paramCount}`);
      updateValues.push(registered_number);
      paramCount++;
    }

    if (website !== undefined) {
      updateFields.push(`website = $${paramCount}`);
      updateValues.push(website);
      paramCount++;
    }

    if (phone !== undefined) {
      updateFields.push(`phone = $${paramCount}`);
      updateValues.push(phone);
      paramCount++;
    }

    if (address !== undefined) {
      updateFields.push(`address = $${paramCount}`);
      updateValues.push(address);
      paramCount++;
    }

    if (latitude !== undefined) {
      updateFields.push(`latitude = $${paramCount}`);
      updateValues.push(latitude);
      paramCount++;
    }

    if (longitude !== undefined) {
      updateFields.push(`longitude = $${paramCount}`);
      updateValues.push(longitude);
      paramCount++;
    }

    if (business_type !== undefined) {
      // Validate business_type
      const validBusinessTypes = ['manufacturer', 'distributor', 'recycler', 'retailer', 'wholesaler', 'service', 'other'];
      if (!validBusinessTypes.includes(business_type)) {
        return res.status(400).json({ 
          error: `Invalid business_type. Must be one of: ${validBusinessTypes.join(', ')}` 
        });
      }
      updateFields.push(`business_type = $${paramCount}`);
      updateValues.push(business_type);
      paramCount++;
    }

    // Always update updated_at
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add id as the last parameter
    updateValues.push(id);

    const updateQuery = `
      UPDATE businesses 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json({
      message: 'Business updated successfully',
      business: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
});

// DELETE /api/businesses/:id - Delete business (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    // Only admin can delete businesses
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    // Check if business exists
    const businessCheck = await pool.query(
      'SELECT owner_id FROM businesses WHERE id = $1',
      [id]
    );

    if (businessCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Delete business (cascade will handle materials and transactions)
    await pool.query('DELETE FROM businesses WHERE id = $1', [id]);

    // Update the owner's role back to app_user and clear business_profile_id
    await pool.query(
      'UPDATE users SET role = $1, business_profile_id = NULL WHERE id = $2 AND business_profile_id = $3',
      ['app_user', businessCheck.rows[0].owner_id, id]
    );

    res.json({ message: 'Business deleted successfully' });

  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ error: 'Failed to delete business' });
  }
});

// GET /api/businesses/:id/materials - Get materials for a specific business
router.get('/:id/materials', async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const { condition, material_type, limit = 20, offset = 0 } = req.query;

  try {
    let query = `
      SELECT 
        m.*,
        ws.name as waste_stream_name,
        ws.disposal_method,
        ws.icon_key
      FROM materials m
      JOIN waste_streams ws ON m.material_type = ws.id
      WHERE m.business_id = $1
    `;
    const params = [id];
    let paramCount = 2;

    if (condition) {
      query += ` AND m.condition = $${paramCount}`;
      params.push(condition);
      paramCount++;
    }

    if (material_type) {
      query += ` AND m.material_type = $${paramCount}`;
      params.push(parseInt(material_type));
      paramCount++;
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM materials WHERE business_id = $1`;
    const countParams = [id];
    paramCount = 2;

    if (condition) {
      countQuery += ` AND condition = $${paramCount}`;
      countParams.push(condition);
      paramCount++;
    }

    if (material_type) {
      countQuery += ` AND material_type = $${paramCount}`;
      countParams.push(parseInt(material_type));
      paramCount++;
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      materials: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error fetching business materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

module.exports = router;