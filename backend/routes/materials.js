const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

console.log('Materials router loaded');

const JWT_SECRET = process.env.JWT_SECRET || 'REDACTED';

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
  res.json({ message: 'Materials router is working' });
});

// GET /api/materials - List all materials (public, with advanced filters)
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  const { 
    condition, 
    material_type, 
    min_quantity, 
    max_quantity,
    min_price,
    max_price,
    search,
    business_type,
    verified_business,
    near_lat,
    near_lng,
    radius_km = 50,
    limit = 20, 
    offset = 0 
  } = req.query;

  try {
    let query = `
      SELECT 
        m.id,
        m.title as name,
        m.description,
        m.material_type,
        m.business_id,
        m.quantity,
        m.unit,
        m.condition,
        m.price_per_unit,
        m.latitude,
        m.longitude,
        m.available_from,
        m.available_until,
        m.created_at,
        m.updated_at,
        ws.name as waste_stream_name,
        ws.disposal_method,
        ws.icon_key,
        b.name as business_name,
        b.verified as business_verified,
        b.business_type as business_type,
        b.address as business_address,
        b.latitude as business_lat,
        b.longitude as business_lng
      FROM materials m
      JOIN waste_streams ws ON m.material_type = ws.id
      JOIN businesses b ON m.business_id = b.id
      WHERE m.condition = 'available'
    `;
    const params = [];
    let paramCount = 1;

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

    if (min_quantity) {
      query += ` AND m.quantity >= $${paramCount}`;
      params.push(parseFloat(min_quantity));
      paramCount++;
    }

    if (max_quantity) {
      query += ` AND m.quantity <= $${paramCount}`;
      params.push(parseFloat(max_quantity));
      paramCount++;
    }

    if (min_price) {
      query += ` AND (m.price_per_unit IS NULL OR m.price_per_unit >= $${paramCount})`;
      params.push(parseFloat(min_price));
      paramCount++;
    }

    if (max_price) {
      query += ` AND (m.price_per_unit IS NULL OR m.price_per_unit <= $${paramCount})`;
      params.push(parseFloat(max_price));
      paramCount++;
    }

    if (search) {
      query += ` AND (
        m.title ILIKE $${paramCount} OR 
        m.description ILIKE $${paramCount} OR
        b.name ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (business_type) {
      query += ` AND b.business_type = $${paramCount}`;
      params.push(business_type);
      paramCount++;
    }

    if (verified_business === 'true') {
      query += ` AND b.verified = true`;
    }

    // Geolocation filter - using PostgreSQL earthdistance extension (cube + earthdistance)
    if (near_lat && near_lng) {
      const lat = parseFloat(near_lat);
      const lng = parseFloat(near_lng);
      const radius = parseFloat(radius_km);
      
      // Using earthdistance extension (already installed)
      query += ` AND earth_distance(ll_to_earth(b.latitude, b.longitude), ll_to_earth($${paramCount}, $${paramCount + 1})) <= $${paramCount + 2} * 1000`;
      params.push(lat, lng, radius);
      paramCount += 3;
    }

    query += ` ORDER BY 
      CASE WHEN b.verified THEN 0 ELSE 1 END,
      m.created_at DESC 
      LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM materials m
      JOIN businesses b ON m.business_id = b.id
      WHERE m.condition = 'available'
    `;
    const countParams = [];
    paramCount = 1;

    if (condition) {
      countQuery += ` AND m.condition = $${paramCount}`;
      countParams.push(condition);
      paramCount++;
    }

    if (material_type) {
      countQuery += ` AND m.material_type = $${paramCount}`;
      countParams.push(parseInt(material_type));
      paramCount++;
    }

    if (min_quantity) {
      countQuery += ` AND m.quantity >= $${paramCount}`;
      countParams.push(parseFloat(min_quantity));
      paramCount++;
    }

    if (max_quantity) {
      countQuery += ` AND m.quantity <= $${paramCount}`;
      countParams.push(parseFloat(max_quantity));
      paramCount++;
    }

    if (min_price) {
      countQuery += ` AND (m.price_per_unit IS NULL OR m.price_per_unit >= $${paramCount})`;
      countParams.push(parseFloat(min_price));
      paramCount++;
    }

    if (max_price) {
      countQuery += ` AND (m.price_per_unit IS NULL OR m.price_per_unit <= $${paramCount})`;
      countParams.push(parseFloat(max_price));
      paramCount++;
    }

    if (search) {
      countQuery += ` AND (
        m.title ILIKE $${paramCount} OR 
        m.description ILIKE $${paramCount} OR
        b.name ILIKE $${paramCount}
      )`;
      countParams.push(`%${search}%`);
      paramCount++;
    }

    if (business_type) {
      countQuery += ` AND b.business_type = $${paramCount}`;
      countParams.push(business_type);
      paramCount++;
    }

    if (verified_business === 'true') {
      countQuery += ` AND b.verified = true`;
    }

    // Geolocation filter for count
    if (near_lat && near_lng) {
      const lat = parseFloat(near_lat);
      const lng = parseFloat(near_lng);
      const radius = parseFloat(radius_km);
      
      countQuery += ` AND earth_distance(ll_to_earth(b.latitude, b.longitude), ll_to_earth($${paramCount}, $${paramCount + 1})) <= $${paramCount + 2} * 1000`;
      countParams.push(lat, lng, radius);
      paramCount += 3;
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
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// GET /api/materials/waste-streams - Get all waste streams (public)
router.get('/waste-streams', async (req, res) => {
  const pool = req.app.locals.pool;

  try {
    const result = await pool.query(
      'SELECT * FROM waste_streams ORDER BY id'
    );

    res.json({ waste_streams: result.rows });

  } catch (error) {
    console.error('Error fetching waste streams:', error);
    res.status(500).json({ error: 'Failed to fetch waste streams' });
  }
});

// GET /api/materials/:id - Get material by ID (public)
router.get('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        m.id,
        m.title as name,
        m.description,
        m.material_type,
        m.business_id,
        m.quantity,
        m.unit,
        m.condition,
        m.price_per_unit,
        m.latitude,
        m.longitude,
        m.available_from,
        m.available_until,
        m.created_at,
        m.updated_at,
        ws.name as waste_stream_name,
        ws.disposal_method,
        ws.icon_key,
        ws.description as waste_stream_description,
        b.name as business_name,
        b.description as business_description,
        b.registered_number,
        b.website,
        b.phone,
        b.address as business_address,
        b.latitude as business_lat,
        b.longitude as business_lng,
        b.verified as business_verified,
        b.business_type,
        u.name as owner_name,
        u.email as owner_email
       FROM materials m
       JOIN waste_streams ws ON m.material_type = ws.id
       JOIN businesses b ON m.business_id = b.id
       LEFT JOIN users u ON b.owner_id = u.id
       WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Get related materials from same business
    const relatedResult = await pool.query(
      `SELECT 
        m.id, m.title as name, m.description, m.condition, m.quantity, m.unit,
        m.price_per_unit, m.created_at,
        ws.name as waste_stream_name,
        ws.icon_key
       FROM materials m
       JOIN waste_streams ws ON m.material_type = ws.id
       WHERE m.business_id = $1 
         AND m.id != $2 
         AND m.condition = 'available'
       ORDER BY m.created_at DESC
       LIMIT 5`,
      [result.rows[0].business_id, id]
    );

    res.json({ 
      material: result.rows[0],
      related_materials: relatedResult.rows
    });

  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ error: 'Failed to fetch material' });
  }
});

// GET /api/materials/my - Get current user's business materials (authenticated, business only)
router.get('/my/materials', authenticateToken, authorizeBusiness, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const { condition, limit = 20, offset = 0 } = req.query;

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

    let query = `
      SELECT 
        m.id,
        m.title as name,
        m.description,
        m.material_type,
        m.business_id,
        m.quantity,
        m.unit,
        m.condition,
        m.price_per_unit,
        m.latitude,
        m.longitude,
        m.available_from,
        m.available_until,
        m.created_at,
        m.updated_at,
        ws.name as waste_stream_name,
        ws.disposal_method,
        ws.icon_key
      FROM materials m
      JOIN waste_streams ws ON m.material_type = ws.id
      WHERE m.business_id = $1
    `;
    const params = [businessId];
    let paramCount = 2;

    if (condition) {
      query += ` AND m.condition = $${paramCount}`;
      params.push(condition);
      paramCount++;
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM materials WHERE business_id = $1`;
    const countParams = [businessId];
    paramCount = 2;

    if (condition) {
      countQuery += ` AND condition = $${paramCount}`;
      countParams.push(condition);
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
    console.error('Error fetching user materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// POST /api/materials - Create new material (authenticated, business only)
router.post('/', authenticateToken, authorizeBusiness, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const {
    name,
    description,
    material_type,
    quantity,
    unit,
    condition,
    price_per_unit,
    available_from,
    available_until
  } = req.body;

  try {
    // Validate required fields
    if (!name || !material_type || !quantity || !condition) {
      return res.status(400).json({ 
        error: 'Name, material_type, quantity, and condition are required' 
      });
    }

    // Validate material_type exists
    const wasteStreamCheck = await pool.query(
      'SELECT id FROM waste_streams WHERE id = $1',
      [material_type]
    );

    if (wasteStreamCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid material_type' });
    }

    // Validate condition
    const validConditions = ['available', 'reserved', 'exchanged', 'archived'];
    if (!validConditions.includes(condition)) {
      return res.status(400).json({ 
        error: `Invalid condition. Must be one of: ${validConditions.join(', ')}` 
      });
    }

    // Get user's business ID
    const businessResult = await pool.query(
      'SELECT id FROM businesses WHERE owner_id = $1',
      [userId]
    );

    if (businessResult.rows.length === 0) {
      return res.status(404).json({ error: 'No business profile found. Create a business first.' });
    }

    const businessId = businessResult.rows[0].id;

    // Create material
    const result = await pool.query(
      `INSERT INTO materials (
        title, description, material_type, business_id, quantity, unit,
        condition, price_per_unit, available_from, available_until
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING 
        id,
        title as name,
        description,
        material_type,
        business_id,
        quantity,
        unit,
        condition,
        price_per_unit,
        latitude,
        longitude,
        available_from,
        available_until,
        created_at,
        updated_at`,
      [
        name,
        description || null,
        material_type,
        businessId,
        parseFloat(quantity),
        unit || null,
        condition,
        price_per_unit ? parseFloat(price_per_unit) : null,
        available_from || null,
        available_until || null
      ]
    );

    res.status(201).json({
      message: 'Material created successfully',
      material: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

// PUT /api/materials/:id - Update material (authenticated, owner only)
router.put('/:id', authenticateToken, authorizeBusiness, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const { id } = req.params;
  const {
    name,
    description,
    material_type,
    quantity,
    unit,
    condition,
    price_per_unit,
    available_from,
    available_until
  } = req.body;

  try {
    // Verify user owns this material
    const ownershipCheck = await pool.query(
      `SELECT m.id, b.owner_id 
       FROM materials m
       JOIN businesses b ON m.business_id = b.id
       WHERE m.id = $1`,
      [id]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const material = ownershipCheck.rows[0];
    
    if (req.user.role !== 'admin' && material.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only update your own materials.' });
    }

    // Validate material_type if provided
    if (material_type !== undefined) {
      const wasteStreamCheck = await pool.query(
        'SELECT id FROM waste_streams WHERE id = $1',
        [material_type]
      );

      if (wasteStreamCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid material_type' });
      }
    }

    // Validate condition if provided
    if (condition !== undefined) {
      const validConditions = ['available', 'reserved', 'exchanged', 'archived'];
      if (!validConditions.includes(condition)) {
        return res.status(400).json({ 
          error: `Invalid condition. Must be one of: ${validConditions.join(', ')}` 
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`title = $${paramCount}`);
      updateValues.push(name);
      paramCount++;
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      updateValues.push(description);
      paramCount++;
    }

    if (material_type !== undefined) {
      updateFields.push(`material_type = $${paramCount}`);
      updateValues.push(material_type);
      paramCount++;
    }

    if (quantity !== undefined) {
      updateFields.push(`quantity = $${paramCount}`);
      updateValues.push(parseFloat(quantity));
      paramCount++;
    }

    if (unit !== undefined) {
      updateFields.push(`unit = $${paramCount}`);
      updateValues.push(unit);
      paramCount++;
    }

    if (condition !== undefined) {
      updateFields.push(`condition = $${paramCount}`);
      updateValues.push(condition);
      paramCount++;
    }

    if (price_per_unit !== undefined) {
      updateFields.push(`price_per_unit = $${paramCount}`);
      updateValues.push(price_per_unit ? parseFloat(price_per_unit) : null);
      paramCount++;
    }

    if (available_from !== undefined) {
      updateFields.push(`available_from = $${paramCount}`);
      updateValues.push(available_from);
      paramCount++;
    }

    if (available_until !== undefined) {
      updateFields.push(`available_until = $${paramCount}`);
      updateValues.push(available_until);
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
      UPDATE materials 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id,
        title as name,
        description,
        material_type,
        business_id,
        quantity,
        unit,
        condition,
        price_per_unit,
        latitude,
        longitude,
        available_from,
        available_until,
        created_at,
        updated_at
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({
      message: 'Material updated successfully',
      material: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ error: 'Failed to update material' });
  }
});

// DELETE /api/materials/:id - Delete material (authenticated, owner only)
router.delete('/:id', authenticateToken, authorizeBusiness, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    // Verify user owns this material
    const ownershipCheck = await pool.query(
      `SELECT m.id, b.owner_id 
       FROM materials m
       JOIN businesses b ON m.business_id = b.id
       WHERE m.id = $1`,
      [id]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const material = ownershipCheck.rows[0];
    
    if (req.user.role !== 'admin' && material.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only delete your own materials.' });
    }

    // Check if material has active transactions
    const transactionsCheck = await pool.query(
      'SELECT id FROM transactions WHERE material_id = $1 AND status IN (\'pending\', \'confirmed\')',
      [id]
    );

    if (transactionsCheck.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete material with active transactions. Update condition to "unavailable" instead.' 
      });
    }

    // Delete material
    await pool.query('DELETE FROM materials WHERE id = $1', [id]);

    res.json({ message: 'Material deleted successfully' });

  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

// POST /api/materials/:id/enquire - Send enquiry for a material (authenticated, business users only)
router.post('/:id/enquire', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    // 1. Get the logged-in user's business ID
    // First try to get business_profile_id from users table (added in migration 010)
    let buyerBusinessId = null;
    
    try {
      // Check if users table has business_profile_id column
      const userResult = await pool.query(
        'SELECT business_profile_id FROM users WHERE id = $1',
        [userId]
      );
      
      if (userResult.rows.length > 0 && userResult.rows[0].business_profile_id) {
        buyerBusinessId = userResult.rows[0].business_profile_id;
        console.log(`Found business ID ${buyerBusinessId} from users.business_profile_id for user ${userId}`);
      }
    } catch (error) {
      // Column might not exist if migration 010 not applied yet
      console.log(`business_profile_id column may not exist: ${error.message}`);
    }
    
    // Fallback: query businesses table by owner_id
    if (!buyerBusinessId) {
      const businessResult = await pool.query(
        'SELECT id FROM businesses WHERE owner_id = $1',
        [userId]
      );

      if (businessResult.rows.length === 0) {
        return res.status(400).json({ 
          error: 'You need a business profile to send enquiries. Please create a business profile first.' 
        });
      }

      buyerBusinessId = businessResult.rows[0].id;
      console.log(`Found business ID ${buyerBusinessId} from businesses.owner_id for user ${userId}`);
    }

    // 2. Get the material by ID
    const materialResult = await pool.query(
      `SELECT m.id, m.business_id as seller_business_id, m.title, 
              b.owner_id as seller_owner_id
       FROM materials m
       JOIN businesses b ON m.business_id = b.id
       WHERE m.id = $1`,
      [id]
    );

    if (materialResult.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const material = materialResult.rows[0];
    const sellerBusinessId = material.seller_business_id;

    // 3. Prevent the material owner from enquiring on their own listing
    if (buyerBusinessId === sellerBusinessId) {
      return res.status(400).json({ 
        error: 'You cannot send an enquiry for your own material listing.' 
      });
    }

    // 4. Check for duplicate enquiry (same buyer/material with status 'enquiry')
    const duplicateCheck = await pool.query(
      `SELECT id FROM transactions 
       WHERE material_id = $1 
         AND buyer_id = $2 
         AND status = 'enquiry'`,
      [id, buyerBusinessId]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(200).json({ 
        message: 'Enquiry already sent' 
      });
    }

    // 5. Insert a new transaction record with status 'enquiry'
    const transactionResult = await pool.query(
      `INSERT INTO transactions (
        material_id, seller_id, buyer_id, 
        quantity_exchanged, unit, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, created_at`,
      [
        id,
        sellerBusinessId,
        buyerBusinessId,
        null, // quantity_exchanged (NULL for enquiry)
        null, // unit (NULL for enquiry)
        'enquiry'
      ]
    );

    res.status(201).json({
      message: 'Enquiry sent successfully',
      enquiry: {
        id: transactionResult.rows[0].id,
        created_at: transactionResult.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Error sending enquiry:', error);
    res.status(500).json({ error: 'Failed to send enquiry' });
  }
});

module.exports = router;
