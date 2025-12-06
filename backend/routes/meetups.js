const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// JWT Secret - use environment variable in production, fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'REDACTED';

/**
 * Authentication middleware - verifies JWT token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Generate a unique 6-character alphanumeric meetup code
 */
function generateMeetupCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * POST /api/meetups/create
 * Create a new meetup (AUTHENTICATED - requires JWT)
 * 
 * Request body: {
 *   title: string (optional),
 *   vibe: "Coffee"|"Food"|"Drinks"|"Walk",
 *   budget_level: "€"|"€€"|"€€€",
 *   fairness_mode: "fastest"|"sustainable"|"accessible",
 *   creator_location: { name: string, lat: number, lng: number },
 *   transit_mode: "walking"|"driving"|"transit"|"bicycling"
 * }
 */
router.post('/create', authenticateToken, async (req, res) => {
  const {
    title,
    vibe,
    budget_level,
    fairness_mode,
    creator_location,
    transit_mode
  } = req.body;

  try {
    const pool = req.app.locals.pool;
    const userId = req.user.userId;

    // Get user details
    const userResult = await pool.query(
      'SELECT id, name FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Validate required fields
    if (!vibe || !budget_level || !creator_location) {
      return res.status(400).json({ error: 'Missing required fields: vibe, budget_level, creator_location' });
    }

    if (!creator_location.name || creator_location.lat === undefined || creator_location.lng === undefined) {
      return res.status(400).json({ error: 'creator_location must include name, lat, and lng' });
    }

    // Validate vibe
    const validVibes = ['Coffee', 'Food', 'Drinks', 'Walk'];
    if (!validVibes.includes(vibe)) {
      return res.status(400).json({ error: `Invalid vibe. Must be one of: ${validVibes.join(', ')}` });
    }

    // Validate budget_level
    const validBudgets = ['€', '€€', '€€€'];
    if (!validBudgets.includes(budget_level)) {
      return res.status(400).json({ error: `Invalid budget_level. Must be one of: ${validBudgets.join(', ')}` });
    }

    // Validate fairness_mode
    const validFairnessModes = ['fastest', 'sustainable', 'accessible'];
    const selectedFairnessMode = fairness_mode || 'fastest';
    if (!validFairnessModes.includes(selectedFairnessMode)) {
      return res.status(400).json({ error: `Invalid fairness_mode. Must be one of: ${validFairnessModes.join(', ')}` });
    }

    // Validate transit_mode
    const validTransitModes = ['walking', 'driving', 'transit', 'bicycling'];
    const selectedTransitMode = transit_mode || 'walking';
    if (!validTransitModes.includes(selectedTransitMode.toLowerCase())) {
      return res.status(400).json({ error: `Invalid transit_mode. Must be one of: ${validTransitModes.join(', ')}` });
    }

    // Generate unique meetup code
    let meetup_code;
    let codeExists = true;
    let attempts = 0;
    const maxAttempts = 10;

    while (codeExists && attempts < maxAttempts) {
      meetup_code = generateMeetupCode();
      const checkResult = await pool.query(
        'SELECT id FROM meetups WHERE meetup_code = $1',
        [meetup_code]
      );
      codeExists = checkResult.rows.length > 0;
      attempts++;
    }

    if (codeExists) {
      return res.status(500).json({ error: 'Failed to generate unique meetup code' });
    }

    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Insert new meetup
    const meetupResult = await pool.query(
      `INSERT INTO meetups (
        meetup_code,
        created_by,
        created_by_name,
        meetup_title,
        meetup_vibe,
        budget_level,
        fairness_mode,
        status,
        calculation_status,
        expires_at,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING id, meetup_code`,
      [
        meetup_code,
        userId,
        user.name,
        title || null,
        vibe,
        budget_level,
        selectedFairnessMode,
        'pending',
        'pending',
        expiresAt
      ]
    );

    const meetup = meetupResult.rows[0];

    // Insert creator as first participant
    await pool.query(
      `INSERT INTO meetup_participants (
        meetup_id,
        user_id,
        participant_name,
        location_name,
        location_lat,
        location_lng,
        transit_mode,
        is_private,
        joined_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        meetup.id,
        userId,
        user.name,
        creator_location.name,
        creator_location.lat,
        creator_location.lng,
        selectedTransitMode.toLowerCase(),
        false
      ]
    );

    res.status(201).json({
      success: true,
      meetup: {
        id: meetup.id,
        meetup_code: meetup.meetup_code,
        shareable_url: `https://mim.town/join/${meetup.meetup_code}`
      }
    });

  } catch (error) {
    console.error('Error creating meetup:', error);
    res.status(500).json({ error: 'Failed to create meetup' });
  }
});

/**
 * GET /api/meetups/code/:meetupCode
 * Get meetup details by code (PUBLIC - no auth required)
 */
router.get('/code/:meetupCode', async (req, res) => {
  const { meetupCode } = req.params;

  try {
    const pool = req.app.locals.pool;

    // Get meetup details
    const meetupResult = await pool.query(
      `SELECT
        id,
        meetup_code,
        meetup_title,
        meetup_vibe,
        budget_level,
        fairness_mode,
        created_by_name,
        status,
        calculation_status,
        created_at
      FROM meetups
      WHERE meetup_code = $1`,
      [meetupCode.toUpperCase()]
    );

    if (meetupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    const meetup = meetupResult.rows[0];

    // Count participants
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM meetup_participants WHERE meetup_id = $1',
      [meetup.id]
    );

    const participantCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      meetup: {
        id: meetup.id,
        title: meetup.meetup_title,
        vibe: meetup.meetup_vibe,
        budget_level: meetup.budget_level,
        fairness_mode: meetup.fairness_mode,
        creator_name: meetup.created_by_name,
        status: meetup.status,
        calculation_status: meetup.calculation_status,
        participant_count: participantCount,
        max_participants: 2,
        created_at: meetup.created_at
      }
    });

  } catch (error) {
    console.error('Error fetching meetup:', error);
    res.status(500).json({ error: 'Failed to fetch meetup' });
  }
});

/**
 * POST /api/meetups/code/:meetupCode/join
 * Join a meetup (PUBLIC - no auth required)
 * 
 * Request body: {
 *   name: string,
 *   location: { name: string, lat: number, lng: number },
 *   transit_mode: "walking"|"driving"|"transit"|"bicycling"
 * }
 */
router.post('/code/:meetupCode/join', async (req, res) => {
  const { meetupCode } = req.params;
  const { name, location, transit_mode } = req.body;

  try {
    const pool = req.app.locals.pool;

    // Validate required fields
    if (!name || !location) {
      return res.status(400).json({ error: 'Missing required fields: name, location' });
    }

    if (!location.name || location.lat === undefined || location.lng === undefined) {
      return res.status(400).json({ error: 'location must include name, lat, and lng' });
    }

    // Validate transit_mode
    const validTransitModes = ['walking', 'driving', 'transit', 'bicycling'];
    const selectedTransitMode = transit_mode || 'walking';
    if (!validTransitModes.includes(selectedTransitMode.toLowerCase())) {
      return res.status(400).json({ error: `Invalid transit_mode. Must be one of: ${validTransitModes.join(', ')}` });
    }

    // Find meetup by code
    const meetupResult = await pool.query(
      'SELECT id, status FROM meetups WHERE meetup_code = $1',
      [meetupCode.toUpperCase()]
    );

    if (meetupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    const meetup = meetupResult.rows[0];

    // Count current participants
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM meetup_participants WHERE meetup_id = $1',
      [meetup.id]
    );

    const currentCount = parseInt(countResult.rows[0].count);

    // Check if meetup is full
    if (currentCount >= 2) {
      return res.status(400).json({ error: 'Meetup is full' });
    }

    // Insert new participant (user_id = NULL for guest/anonymous users)
    const participantResult = await pool.query(
      `INSERT INTO meetup_participants (
        meetup_id,
        user_id,
        participant_name,
        location_name,
        location_lat,
        location_lng,
        transit_mode,
        is_private,
        joined_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id`,
      [
        meetup.id,
        null, // user_id is NULL for guest users
        name,
        location.name,
        location.lat,
        location.lng,
        selectedTransitMode.toLowerCase(),
        false
      ]
    );

    const participant = participantResult.rows[0];

    // Count again after insert
    const newCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM meetup_participants WHERE meetup_id = $1',
      [meetup.id]
    );

    const newCount = parseInt(newCountResult.rows[0].count);

    // If we now have 2 participants, update meetup status to active
    // Note: calculation_status remains 'pending' until organizer manually triggers calculation
    if (newCount === 2) {
      await pool.query(
        `UPDATE meetups
         SET status = 'active'
         WHERE id = $1`,
        [meetup.id]
      );
    }

    res.status(201).json({
      success: true,
      participant: {
        id: participant.id,
        name: name
      }
    });

  } catch (error) {
    console.error('Error joining meetup:', error);
    res.status(500).json({ error: 'Failed to join meetup' });
  }
});

module.exports = router;
