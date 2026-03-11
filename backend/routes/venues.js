const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

console.log('Venues router loaded (with accessibility)');

const JWT_SECRET = process.env.JWT_SECRET || 'REDACTED';

// Authentication middleware (optional for some endpoints)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
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
  res.json({ message: 'Venues router is working' });
});

// GET /api/venues - Search venues with accessibility filters
router.get('/venues', async (req, res) => {
  const pool = req.app.locals.pool;
  const {
    lat,
    lng,
    radius = 5000, // in meters
    venueType,
    mobilityType,
    noiseLevel,
    crowdLevel,
    hasAccessibleToilet,
    hasStepFreeEntrance,
    hasQuietSpace,
    limit = 20,
    offset = 0
  } = req.query;

  try {
    // Base query for venues
    let query = `
      SELECT 
        v.*,
        p.step_free_entrance,
        p.accessible_toilet,
        p.wheelchair_space_available,
        p.lift_available,
        s.noise_level,
        s.typical_crowd_level,
        s.quiet_space_available,
        s.staff_autism_trained
      FROM venues v
      LEFT JOIN legacy_venue_physical_accessibility p ON v.id = p.venue_id AND p.verified = true
      LEFT JOIN legacy_venue_sensory_accessibility s ON v.id = s.venue_id AND s.verified = true
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 1;

    // Location filter (if lat/lng provided)
    if (lat && lng) {
      // Using simple bounding box for simplicity. In production, use PostGIS for proper distance.
      // We'll filter by approximate distance (in degrees) - 1 degree ≈ 111 km at equator
      const radiusDeg = radius / 111000.0;
      const latMin = parseFloat(lat) - radiusDeg;
      const latMax = parseFloat(lat) + radiusDeg;
      const lngMin = parseFloat(lng) - radiusDeg;
      const lngMax = parseFloat(lng) + radiusDeg;

      query += ` AND v.lat BETWEEN $${paramCount} AND $${paramCount + 1}`;
      queryParams.push(latMin, latMax);
      paramCount += 2;
      query += ` AND v.lng BETWEEN $${paramCount} AND $${paramCount + 1}`;
      queryParams.push(lngMin, lngMax);
      paramCount += 2;
    }

    // Venue type filter
    if (venueType) {
      query += ` AND v.venue_type = $${paramCount}`;
      queryParams.push(venueType);
      paramCount++;
    }

    // Accessibility filters
    if (hasStepFreeEntrance === 'true') {
      query += ` AND p.step_free_entrance = true`;
    }
    if (hasAccessibleToilet === 'true') {
      query += ` AND p.accessible_toilet = true`;
    }
    if (noiseLevel) {
      query += ` AND s.noise_level = $${paramCount}`;
      queryParams.push(noiseLevel);
      paramCount++;
    }
    if (crowdLevel) {
      query += ` AND s.typical_crowd_level = $${paramCount}`;
      queryParams.push(crowdLevel);
      paramCount++;
    }
    if (hasQuietSpace === 'true') {
      query += ` AND s.quiet_space_available = true`;
    }

    // Add limit and offset
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM venues v
      LEFT JOIN legacy_venue_physical_accessibility p ON v.id = p.venue_id AND p.verified = true
      LEFT JOIN legacy_venue_sensory_accessibility s ON v.id = s.venue_id AND s.verified = true
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 1;

    // Repeat the same filters for count
    if (lat && lng) {
      const radiusDeg = radius / 111000.0;
      const latMin = parseFloat(lat) - radiusDeg;
      const latMax = parseFloat(lat) + radiusDeg;
      const lngMin = parseFloat(lng) - radiusDeg;
      const lngMax = parseFloat(lng) + radiusDeg;

      countQuery += ` AND v.lat BETWEEN $${countParamCount} AND $${countParamCount + 1}`;
      countParams.push(latMin, latMax);
      countParamCount += 2;
      countQuery += ` AND v.lng BETWEEN $${countParamCount} AND $${countParamCount + 1}`;
      countParams.push(lngMin, lngMax);
      countParamCount += 2;
    }

    if (venueType) {
      countQuery += ` AND v.venue_type = $${countParamCount}`;
      countParams.push(venueType);
      countParamCount++;
    }

    if (hasStepFreeEntrance === 'true') {
      countQuery += ` AND p.step_free_entrance = true`;
    }
    if (hasAccessibleToilet === 'true') {
      countQuery += ` AND p.accessible_toilet = true`;
    }
    if (noiseLevel) {
      countQuery += ` AND s.noise_level = $${countParamCount}`;
      countParams.push(noiseLevel);
      countParamCount++;
    }
    if (crowdLevel) {
      countQuery += ` AND s.typical_crowd_level = $${countParamCount}`;
      countParams.push(crowdLevel);
      countParamCount++;
    }
    if (hasQuietSpace === 'true') {
      countQuery += ` AND s.quiet_space_available = true`;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      venues: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + result.rows.length) < total
      }
    });

  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ error: 'Failed to fetch venues', details: error.message });
  }
});

// GET /api/venues/:id - Get venue details
router.get('/venues/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;

  try {
    const venueResult = await pool.query(
      'SELECT * FROM venues WHERE id = $1',
      [id]
    );

    if (venueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    const venue = venueResult.rows[0];

    // Get physical accessibility
    const physicalResult = await pool.query(
      'SELECT * FROM legacy_venue_physical_accessibility WHERE venue_id = $1 ORDER BY last_updated DESC LIMIT 1',
      [id]
    );

    // Get sensory accessibility
    const sensoryResult = await pool.query(
      'SELECT * FROM legacy_venue_sensory_accessibility WHERE venue_id = $1 ORDER BY last_updated DESC LIMIT 1',
      [id]
    );

    // Get special events
    const eventsResult = await pool.query(
      'SELECT * FROM legacy_venue_special_events WHERE venue_id = $1 AND active = true AND next_occurrence > NOW() ORDER BY next_occurrence ASC',
      [id]
    );

    // Get reviews summary
    const reviewsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_reviews,
        AVG(overall_rating) as average_rating,
        SUM(CASE WHEN would_recommend THEN 1 ELSE 0 END) as would_recommend_count,
        SUM(CASE WHEN accessibility_needs_met THEN 1 ELSE 0 END) as needs_met_count
       FROM legacy_accessibility_reviews WHERE venue_id = $1`,
      [id]
    );

    res.json({
      venue,
      physicalAccessibility: physicalResult.rows[0] || null,
      sensoryAccessibility: sensoryResult.rows[0] || null,
      specialEvents: eventsResult.rows,
      reviewsSummary: reviewsResult.rows[0] || {
        total_reviews: 0,
        average_rating: null,
        would_recommend_count: 0,
        needs_met_count: 0
      }
    });

  } catch (error) {
    console.error('Error fetching venue details:', error);
    res.status(500).json({ error: 'Failed to fetch venue details', details: error.message });
  }
});

// POST /api/venues - Add new venue (requires authentication)
router.post('/venues', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const {
    name,
    address,
    lat,
    lng,
    venueType,
    googlePlacesId
  } = req.body;

  try {
    // Check if venue already exists by google_places_id
    if (googlePlacesId) {
      const existingVenue = await pool.query(
        'SELECT id FROM venues WHERE google_places_id = $1',
        [googlePlacesId]
      );

      if (existingVenue.rows.length > 0) {
        return res.status(409).json({ error: 'Venue already exists', venueId: existingVenue.rows[0].id });
      }
    }

    const result = await pool.query(
      `INSERT INTO venues (name, address, lat, lng, venue_type, google_places_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, address, lat, lng, venueType, googlePlacesId]
    );

    res.status(201).json({
      message: 'Venue added successfully',
      venue: result.rows[0]
    });

  } catch (error) {
    console.error('Error adding venue:', error);
    res.status(500).json({ error: 'Failed to add venue', details: error.message });
  }
});

// GET /api/venues/:id/accessibility - Get ALL accessibility info for venue
router.get('/venues/:id/accessibility', async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;

  try {
    const [physicalResult, sensoryResult, eventsResult] = await Promise.all([
      pool.query('SELECT * FROM legacy_venue_physical_accessibility WHERE venue_id = $1 ORDER BY last_updated DESC', [id]),
      pool.query('SELECT * FROM legacy_venue_sensory_accessibility WHERE venue_id = $1 ORDER BY last_updated DESC', [id]),
      pool.query('SELECT * FROM legacy_venue_special_events WHERE venue_id = $1 AND active = true ORDER BY next_occurrence ASC', [id])
    ]);

    res.json({
      physicalAccessibility: physicalResult.rows,
      sensoryAccessibility: sensoryResult.rows,
      specialEvents: eventsResult.rows
    });

  } catch (error) {
    console.error('Error fetching venue accessibility:', error);
    res.status(500).json({ error: 'Failed to fetch venue accessibility', details: error.message });
  }
});

// POST /api/venues/:id/physical-access - Submit physical accessibility (requires authentication)
router.post('/venues/:id/physical-access', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const userId = req.user.userId;
  const physicalData = req.body;

  try {
    // Check if venue exists
    const venueCheck = await pool.query('SELECT id FROM venues WHERE id = $1', [id]);
    if (venueCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    const result = await pool.query(
      `INSERT INTO legacy_venue_physical_accessibility (
        venue_id, submitted_by,
        step_free_entrance, entrance_steps_count, ramp_available, automatic_door,
        door_width_cm, door_type,
        disabled_parking_bays, parking_distance_to_entrance_m, parking_covered,
        drop_off_zone, drop_off_location, drop_off_curb_height_cm, drop_off_covered,
        level_access_throughout, lift_available, lift_wheelchair_accessible,
        corridor_width_cm, narrow_passages,
        moveable_chairs, wheelchair_space_available, table_height_cm, space_between_tables,
        accessible_toilet, toilet_grab_rails, toilet_space_for_wheelchair, changing_places_toilet,
        accessibility_notes, photos
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
      )
      RETURNING *`,
      [
        id, userId,
        physicalData.stepFreeEntrance,
        physicalData.entranceStepsCount,
        physicalData.rampAvailable,
        physicalData.automaticDoor,
        physicalData.doorWidthCm,
        physicalData.doorType,
        physicalData.disabledParkingBays,
        physicalData.parkingDistanceToEntranceM,
        physicalData.parkingCovered,
        physicalData.dropOffZone,
        physicalData.dropOffLocation,
        physicalData.dropOffCurbHeightCm,
        physicalData.dropOffCovered,
        physicalData.levelAccessThroughout,
        physicalData.liftAvailable,
        physicalData.liftWheelchairAccessible,
        physicalData.corridorWidthCm,
        physicalData.narrowPassages,
        physicalData.moveableChairs,
        physicalData.wheelchairSpaceAvailable,
        physicalData.tableHeightCm,
        physicalData.spaceBetweenTables,
        physicalData.accessibleToilet,
        physicalData.toiletGrabRails,
        physicalData.toiletSpaceForWheelchair,
        physicalData.changingPlacesToilet,
        physicalData.accessibilityNotes,
        physicalData.photos || []
      ]
    );

    res.status(201).json({
      message: 'Physical accessibility information submitted successfully',
      physicalAccessibility: result.rows[0]
    });

  } catch (error) {
    console.error('Error submitting physical accessibility:', error);
    res.status(500).json({ error: 'Failed to submit physical accessibility', details: error.message });
  }
});

// POST /api/venues/:id/sensory-access - Submit sensory accessibility (requires authentication)
router.post('/venues/:id/sensory-access', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id } = req.params;
  const userId = req.user.userId;
  const sensoryData = req.body;

  try {
    // Check if venue exists
    const venueCheck = await pool.query('SELECT id FROM venues WHERE id = $1', [id]);
    if (venueCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    const result = await pool.query(
      `INSERT INTO legacy_venue_sensory_accessibility (
        venue_id, submitted_by,
        noise_level, background_music, music_volume, live_music,
        lighting_type, flickering_lights, adjustable_lighting,
        typical_crowd_level, busy_times, quiet_times,
        strong_smells, smell_sources,
        quiet_space_available, sensory_overload_escape_route,
        staff_autism_trained, visual_supports_available,
        sensory_notes, photos
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      )
      RETURNING *`,
      [
        id, userId,
        sensoryData.noiseLevel,
        sensoryData.backgroundMusic,
        sensoryData.musicVolume,
        sensoryData.liveMusic,
        sensoryData.lightingType,
        sensoryData.flickeringLights,
        sensoryData.adjustableLighting,
        sensoryData.typicalCrowdLevel,
        sensoryData.busyTimes || [],
        sensoryData.quietTimes || [],
        sensoryData.strongSmells,
        sensoryData.smellSources,
        sensoryData.quietSpaceAvailable,
        sensoryData.sensoryOverloadEscapeRoute,
        sensoryData.staffAutismTrained,
        sensoryData.visualSupportsAvailable,
        sensoryData.sensoryNotes,
        sensoryData.photos || []
      ]
    );

    res.status(201).json({
      message: 'Sensory accessibility information submitted successfully',
      sensoryAccessibility: result.rows[0]
    });

  } catch (error) {
    console.error('Error submitting sensory accessibility:', error);
    res.status(500).json({ error: 'Failed to submit sensory accessibility', details: error.message });
  }
});

// PUT /api/venues/:id/physical-access/:accessId - Update physical accessibility (requires authentication, original submitter or admin)
router.put('/venues/:id/physical-access/:accessId', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id, accessId } = req.params;
  const userId = req.user.userId;
  const physicalData = req.body;

  try {
    // Check if the accessibility entry exists and belongs to the user or user is admin
    const existingCheck = await pool.query(
      'SELECT submitted_by FROM legacy_venue_physical_accessibility WHERE id = $1 AND venue_id = $2',
      [accessId, id]
    );

    if (existingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Physical accessibility entry not found' });
    }

    if (existingCheck.rows[0].submitted_by !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this entry' });
    }

    const result = await pool.query(
      `UPDATE legacy_venue_physical_accessibility
       SET 
         step_free_entrance = $1,
         entrance_steps_count = $2,
         ramp_available = $3,
         automatic_door = $4,
         door_width_cm = $5,
         door_type = $6,
         disabled_parking_bays = $7,
         parking_distance_to_entrance_m = $8,
         parking_covered = $9,
         drop_off_zone = $10,
         drop_off_location = $11,
         drop_off_curb_height_cm = $12,
         drop_off_covered = $13,
         level_access_throughout = $14,
         lift_available = $15,
         lift_wheelchair_accessible = $16,
         corridor_width_cm = $17,
         narrow_passages = $18,
         moveable_chairs = $19,
         wheelchair_space_available = $20,
         table_height_cm = $21,
         space_between_tables = $22,
         accessible_toilet = $23,
         toilet_grab_rails = $24,
         toilet_space_for_wheelchair = $25,
         changing_places_toilet = $26,
         accessibility_notes = $27,
         photos = $28,
         last_updated = NOW()
       WHERE id = $29 AND venue_id = $30
       RETURNING *`,
      [
        physicalData.stepFreeEntrance,
        physicalData.entranceStepsCount,
        physicalData.rampAvailable,
        physicalData.automaticDoor,
        physicalData.doorWidthCm,
        physicalData.doorType,
        physicalData.disabledParkingBays,
        physicalData.parkingDistanceToEntranceM,
        physicalData.parkingCovered,
        physicalData.dropOffZone,
        physicalData.dropOffLocation,
        physicalData.dropOffCurbHeightCm,
        physicalData.dropOffCovered,
        physicalData.levelAccessThroughout,
        physicalData.liftAvailable,
        physicalData.liftWheelchairAccessible,
        physicalData.corridorWidthCm,
        physicalData.narrowPassages,
        physicalData.moveableChairs,
        physicalData.wheelchairSpaceAvailable,
        physicalData.tableHeightCm,
        physicalData.spaceBetweenTables,
        physicalData.accessibleToilet,
        physicalData.toiletGrabRails,
        physicalData.toiletSpaceForWheelchair,
        physicalData.changingPlacesToilet,
        physicalData.accessibilityNotes,
        physicalData.photos || [],
        accessId,
        id
      ]
    );

    res.json({
      message: 'Physical accessibility information updated successfully',
      physicalAccessibility: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating physical accessibility:', error);
    res.status(500).json({ error: 'Failed to update physical accessibility', details: error.message });
  }
});

// PUT /api/venues/:id/sensory-access/:accessId - Update sensory accessibility (requires authentication, original submitter or admin)
router.put('/venues/:id/sensory-access/:accessId', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { id, accessId } = req.params;
  const userId = req.user.userId;
  const sensoryData = req.body;

  try {
    // Check if the accessibility entry exists and belongs to the user or user is admin
    const existingCheck = await pool.query(
      'SELECT submitted_by FROM legacy_venue_sensory_accessibility WHERE id = $1 AND venue_id = $2',
      [accessId, id]
    );

    if (existingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Sensory accessibility entry not found' });
    }

    if (existingCheck.rows[0].submitted_by !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this entry' });
    }

    const result = await pool.query(
      `UPDATE legacy_venue_sensory_accessibility
       SET 
         noise_level = $1,
         background_music = $2,
         music_volume = $3,
         live_music = $4,
         lighting_type = $5,
         flickering_lights = $6,
         adjustable_lighting = $7,
         typical_crowd_level = $8,
         busy_times = $9,
         quiet_times = $10,
         strong_smells = $11,
         smell_sources = $12,
         quiet_space_available = $13,
         sensory_overload_escape_route = $14,
         staff_autism_trained = $15,
         visual_supports_available = $16,
         sensory_notes = $17,
         photos = $18,
         last_updated = NOW()
       WHERE id = $19 AND venue_id = $20
       RETURNING *`,
      [
        sensoryData.noiseLevel,
        sensoryData.backgroundMusic,
        sensoryData.musicVolume,
        sensoryData.liveMusic,
        sensoryData.lightingType,
        sensoryData.flickeringLights,
        sensoryData.adjustableLighting,
        sensoryData.typicalCrowdLevel,
        sensoryData.busyTimes || [],
        sensoryData.quietTimes || [],
        sensoryData.strongSmells,
        sensoryData.smellSources,
        sensoryData.quietSpaceAvailable,
        sensoryData.sensoryOverloadEscapeRoute,
        sensoryData.staffAutismTrained,
        sensoryData.visualSupportsAvailable,
        sensoryData.sensoryNotes,
        sensoryData.photos || [],
        accessId,
        id
      ]
    );

    res.json({
      message: 'Sensory accessibility information updated successfully',
      sensoryAccessibility: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating sensory accessibility:', error);
    res.status(500).json({ error: 'Failed to update sensory accessibility', details: error.message });
  }
});

module.exports = router;