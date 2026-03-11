const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

console.log('Accessible Venues router loaded');

const JWT_SECRET = process.env.JWT_SECRET || 'mimapp-dev-secret-2025';

// Authentication middleware (for admin endpoints)
const authenticateAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    // TODO: Add admin check when we implement roles
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
router.get('/test-accessible-venues', (req, res) => {
  res.json({ message: 'Accessible Venues router is working' });
});

// GET /api/accessible-venues - List all venues with optional filters
router.get('/accessible-venues', async (req, res) => {
  const pool = req.app.locals.pool;
  const {
    accessibility_level,
    venue_type,
    has_accessible_bathroom,
    lat,
    lng,
    radius = 5000, // in meters, default 5km
    limit = 50,
    offset = 0
  } = req.query;

  try {
    // Base query for accessible venues
    let query = `
      SELECT 
        id,
        venue_name,
        address,
        eircode,
        latitude,
        longitude,
        venue_type,
        category,
        phone,
        website,
        wheelchair_entrance,
        wheelchair_bathroom,
        accessible_parking_nearby,
        level_access_internal,
        elevator_available,
        accessible_bar_counter,
        hearing_loop,
        braille_menu,
        service_dog_friendly,
        quiet_space_available,
        wide_doorways,
        low_height_tables,
        wheelchair_space_at_tables,
        booth_seating_transferable,
        accessibility_notes,
        entrance_notes,
        bathroom_notes,
        nearby_accessible_bathrooms,
        accessibility_level,
        data_source,
        source_date,
        last_verified_date,
        verified_by,
        verification_method,
        opening_hours,
        currently_operating,
        user_rating,
        total_ratings,
        created_at,
        updated_at
      FROM legacy_accessible_venues
      WHERE currently_operating = TRUE
    `;

    const queryParams = [];
    let paramCount = 1;

    // Accessibility level filter
    if (accessibility_level) {
      query += ` AND accessibility_level = $${paramCount}`;
      queryParams.push(accessibility_level);
      paramCount++;
    }

    // Venue type filter
    if (venue_type) {
      query += ` AND venue_type = $${paramCount}`;
      queryParams.push(venue_type);
      paramCount++;
    }

    // Has accessible bathroom filter
    if (has_accessible_bathroom === 'true') {
      query += ` AND wheelchair_bathroom = TRUE`;
    } else if (has_accessible_bathroom === 'false') {
      query += ` AND wheelchair_bathroom = FALSE`;
    }

    // Location filter (if lat/lng provided)
    let distanceColumn = '';
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      if (!isNaN(userLat) && !isNaN(userLng)) {
        // Add distance calculation using earthdistance extension
        distanceColumn = `, earth_distance(
          ll_to_earth($${paramCount}, $${paramCount + 1}),
          ll_to_earth(latitude, longitude)
        ) AS distance_meters`;
        queryParams.push(userLat, userLng);
        paramCount += 2;
        
        // Filter by radius if provided
        if (radius && !isNaN(parseFloat(radius))) {
          query += ` AND earth_distance(
            ll_to_earth($${paramCount - 2}, $${paramCount - 1}),
            ll_to_earth(latitude, longitude)
          ) <= $${paramCount}`;
          queryParams.push(parseFloat(radius));
          paramCount++;
        }
      }
    }

    // Add distance column to SELECT if calculated
    if (distanceColumn) {
      // Insert distance column after the SELECT columns
      const selectEndIndex = query.indexOf('FROM');
      query = query.slice(0, selectEndIndex) + distanceColumn + ' ' + query.slice(selectEndIndex);
    }
    
    // Add sorting - by distance if lat/lng provided, otherwise by venue name
    if (lat && lng) {
      query += ` ORDER BY distance_meters ASC NULLS LAST, venue_name ASC`;
    } else {
      query += ` ORDER BY venue_name ASC`;
    }

    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    // Create count query - use a simpler approach: count all rows with the same conditions
    // Build the WHERE clause separately for count query
    let countWhereClause = 'WHERE currently_operating = TRUE';
    const countWhereParams = [];
    let countParamIdx = 1;
    
    if (accessibility_level) {
      countWhereClause += ` AND accessibility_level = $${countParamIdx}`;
      countWhereParams.push(accessibility_level);
      countParamIdx++;
    }
    
    if (venue_type) {
      countWhereClause += ` AND venue_type = $${countParamIdx}`;
      countWhereParams.push(venue_type);
      countParamIdx++;
    }
    
    if (has_accessible_bathroom === 'true') {
      countWhereClause += ` AND wheelchair_bathroom = TRUE`;
    } else if (has_accessible_bathroom === 'false') {
      countWhereClause += ` AND wheelchair_bathroom = FALSE`;
    }
    
    // Handle location filters for count query
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      if (!isNaN(userLat) && !isNaN(userLng) && radius && !isNaN(parseFloat(radius))) {
        countWhereClause += ` AND earth_distance(
          ll_to_earth($${countParamIdx}, $${countParamIdx + 1}),
          ll_to_earth(latitude, longitude)
        ) <= $${countParamIdx + 2}`;
        countWhereParams.push(userLat, userLng, parseFloat(radius));
        countParamIdx += 3;
      }
    }
    
    const countQuery = `SELECT COUNT(*) as total FROM legacy_accessible_venues ${countWhereClause}`;
    
    // Execute count query
    const countResult = await pool.query(countQuery, countWhereParams);
    const total = parseInt(countResult.rows[0]?.total || 0);

    // Execute main query
    const result = await pool.query(query, queryParams);

    // Format response
    const venues = result.rows.map(row => {
      const venue = { ...row };
      
      // Convert distance to kilometers if present
      if (venue.distance_meters !== undefined) {
        venue.distance_km = Math.round((venue.distance_meters / 1000) * 100) / 100;
        delete venue.distance_meters;
      }
      
      return venue;
    });

    res.json({
      venues,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + venues.length) < total
      },
      filters: {
        accessibility_level,
        venue_type,
        has_accessible_bathroom,
        lat,
        lng,
        radius
      }
    });

  } catch (error) {
    console.error('Error fetching accessible venues:', error);
    res.status(500).json({ error: 'Failed to fetch accessible venues', details: error.message });
  }
});

// GET /api/accessible-venues/:id - Get single venue details
router.get('/accessible-venues/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        id,
        venue_name,
        address,
        eircode,
        latitude,
        longitude,
        venue_type,
        category,
        phone,
        website,
        wheelchair_entrance,
        wheelchair_bathroom,
        accessible_parking_nearby,
        level_access_internal,
        elevator_available,
        accessible_bar_counter,
        hearing_loop,
        braille_menu,
        service_dog_friendly,
        quiet_space_available,
        wide_doorways,
        low_height_tables,
        wheelchair_space_at_tables,
        booth_seating_transferable,
        accessibility_notes,
        entrance_notes,
        bathroom_notes,
        nearby_accessible_bathrooms,
        accessibility_level,
        data_source,
        source_date,
        last_verified_date,
        verified_by,
        verification_method,
        opening_hours,
        currently_operating,
        user_rating,
        total_ratings,
        created_at,
        updated_at
      FROM legacy_accessible_venues 
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching venue details:', error);
    res.status(500).json({ error: 'Failed to fetch venue details', details: error.message });
  }
});

// POST /api/accessible-venues - Create new venue
// TODO: Add admin authentication middleware
router.post('/accessible-venues', authenticateAdminToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const {
    venue_name,
    address,
    eircode,
    latitude,
    longitude,
    venue_type,
    category,
    phone,
    website,
    google_place_id,
    wheelchair_entrance,
    wheelchair_bathroom,
    accessible_parking_nearby,
    level_access_internal,
    elevator_available,
    accessible_bar_counter,
    hearing_loop,
    braille_menu,
    service_dog_friendly,
    quiet_space_available,
    wide_doorways,
    low_height_tables,
    wheelchair_space_at_tables,
    booth_seating_transferable,
    accessibility_notes,
    entrance_notes,
    bathroom_notes,
    nearby_accessible_bathrooms,
    accessibility_level,
    data_source,
    source_date,
    last_verified_date,
    verified_by,
    verification_method,
    opening_hours,
    currently_operating
  } = req.body;

  try {
    // Validate required fields
    if (!venue_name) {
      return res.status(400).json({ error: 'Venue name is required' });
    }

    const result = await pool.query(
      `INSERT INTO legacy_accessible_venues (
        venue_name,
        address,
        eircode,
        latitude,
        longitude,
        venue_type,
        category,
        phone,
        website,
        google_place_id,
        wheelchair_entrance,
        wheelchair_bathroom,
        accessible_parking_nearby,
        level_access_internal,
        elevator_available,
        accessible_bar_counter,
        hearing_loop,
        braille_menu,
        service_dog_friendly,
        quiet_space_available,
        wide_doorways,
        low_height_tables,
        wheelchair_space_at_tables,
        booth_seating_transferable,
        accessibility_notes,
        entrance_notes,
        bathroom_notes,
        nearby_accessible_bathrooms,
        accessibility_level,
        data_source,
        source_date,
        last_verified_date,
        verified_by,
        verification_method,
        opening_hours,
        currently_operating
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37
      )
      RETURNING *`,
      [
        venue_name,
        address,
        eircode,
        latitude,
        longitude,
        venue_type,
        category,
        phone,
        website,
        google_place_id,
        wheelchair_entrance,
        wheelchair_bathroom,
        accessible_parking_nearby,
        level_access_internal,
        elevator_available,
        accessible_bar_counter,
        hearing_loop,
        braille_menu,
        service_dog_friendly,
        quiet_space_available,
        wide_doorways,
        low_height_tables,
        wheelchair_space_at_tables,
        booth_seating_transferable,
        accessibility_notes,
        entrance_notes,
        bathroom_notes,
        nearby_accessible_bathrooms,
        accessibility_level,
        data_source,
        source_date,
        last_verified_date,
        verified_by || 'unverified',
        verification_method,
        opening_hours,
        currently_operating !== undefined ? currently_operating : true
      ]
    );

    res.status(201).json({
      message: 'Venue created successfully',
      venue: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating venue:', error);
    
    // Handle unique constraint violation for google_place_id
    if (error.code === '23505' && error.constraint === 'accessible_venues_google_place_id_key') {
      return res.status(409).json({ error: 'Venue with this Google Place ID already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create venue', details: error.message });
  }
});

// PUT /api/accessible-venues/:id - Update venue
// TODO: Add admin authentication middleware
router.put('/accessible-venues/:id', authenticateAdminToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Check if venue exists
    const venueCheck = await pool.query(
      'SELECT id FROM legacy_accessible_venues WHERE id = $1',
      [id]
    );

    if (venueCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramCount = 1;

    // List of allowed fields to update
    const allowedFields = [
      'venue_name', 'address', 'eircode', 'latitude', 'longitude',
      'venue_type', 'category', 'phone', 'website', 'google_place_id',
      'wheelchair_entrance', 'wheelchair_bathroom', 'accessible_parking_nearby',
      'level_access_internal', 'elevator_available', 'accessible_bar_counter',
      'hearing_loop', 'braille_menu', 'service_dog_friendly', 'quiet_space_available',
      'wide_doorways', 'low_height_tables', 'wheelchair_space_at_tables',
      'booth_seating_transferable', 'accessibility_notes', 'entrance_notes',
      'bathroom_notes', 'nearby_accessible_bathrooms', 'accessibility_level',
      'data_source', 'source_date', 'last_verified_date', 'verified_by',
      'verification_method', 'opening_hours', 'currently_operating',
      'user_rating', 'total_ratings'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(updateData[field]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add ID as last parameter
    values.push(id);

    const query = `
      UPDATE legacy_accessible_venues 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json({
      message: 'Venue updated successfully',
      venue: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating venue:', error);
    
    // Handle unique constraint violation for google_place_id
    if (error.code === '23505' && error.constraint === 'accessible_venues_google_place_id_key') {
      return res.status(409).json({ error: 'Venue with this Google Place ID already exists' });
    }
    
    res.status(500).json({ error: 'Failed to update venue', details: error.message });
  }
});

module.exports = router;