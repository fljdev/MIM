const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// JWT Secret - use environment variable in production, fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'mimapp-dev-secret-2025';

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
 * Helper function to resolve meetup ID from either numeric ID or meetup code
 */
async function resolveMeetupId(pool, idOrCode) {
  // Check if it's a numeric ID
  if (!isNaN(idOrCode) && Number.isInteger(Number(idOrCode))) {
    return parseInt(idOrCode);
  }
  
  // It's a meetup code, look up the actual ID
  const result = await pool.query(
    'SELECT id FROM meetups WHERE meetup_code = $1',
    [idOrCode.toUpperCase()]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0].id;
}

/**
 * POST /api/meetups/create
 * Create a new meetup (AUTHENTICATED - requires JWT)
 * 
 * Request body: {
 *   title: string (optional),
 *   vibe: "Coffee"|"Food"|"Drinks"|"Walk" (case-insensitive),
 *   budget_level: "€"|"€€"|"€€€",
 *   fairness_mode: "fastest"|"sustainable"|"accessible" (case-insensitive),
 *   creator_location: { name: string, lat: number, lng: number },
 *   transit_mode: "walking"|"driving"|"transit"|"bicycling" (case-insensitive),
 *   privacy_mode: boolean
 * }
 */
router.post('/create', authenticateToken, async (req, res) => {
  const {
    title,
    vibe,
    budget_level,
    fairness_mode,
    creator_location,
    transit_mode,
    privacy_mode,
    proposed_date,
    proposed_time_start,
    proposed_time_end,
    is_time_flexible
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
    if (!vibe || !budget_level || !creator_location || transit_mode === undefined) {
      return res.status(400).json({ error: 'Missing required fields: vibe, budget_level, creator_location, transit_mode' });
    }

    if (!creator_location.name || creator_location.lat === undefined || creator_location.lng === undefined) {
      return res.status(400).json({ error: 'creator_location must include name, lat, and lng' });
    }

    // Validate vibe (case-insensitive)
    const validVibes = ['coffee', 'food', 'drinks', 'walk'];
    const vibeLower = vibe.toLowerCase();
    if (!validVibes.includes(vibeLower)) {
      return res.status(400).json({ error: `Invalid vibe. Must be one of: ${validVibes.join(', ')}` });
    }

    // Validate budget_level
    const validBudgets = ['€', '€€', '€€€'];
    if (!validBudgets.includes(budget_level)) {
      return res.status(400).json({ error: `Invalid budget_level. Must be one of: ${validBudgets.join(', ')}` });
    }

    // Validate fairness_mode (case-insensitive)
    const validFairnessModes = ['fastest', 'sustainable', 'accessible'];
    const selectedFairnessMode = (fairness_mode || 'fastest').toLowerCase();
    if (!validFairnessModes.includes(selectedFairnessMode)) {
      return res.status(400).json({ error: `Invalid fairness_mode. Must be one of: ${validFairnessModes.join(', ')}` });
    }

    // Validate transit_mode (case-insensitive)
    console.log(`[Meetup Debug] Received transit_mode from API: ${transit_mode}`);
    const validTransitModes = ['walking', 'driving', 'transit', 'bicycling'];
    const selectedTransitMode = (transit_mode || 'walking').toLowerCase();
    console.log(`[Meetup Debug] Processed transit_mode (lowercased): ${selectedTransitMode}`);
    if (!validTransitModes.includes(selectedTransitMode)) {
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
        global_privacy,
        status,
        calculation_status,
        expires_at,
        proposed_date,
        proposed_time_start,
        proposed_time_end,
        is_time_flexible,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
      RETURNING id, meetup_code`,
      [
        meetup_code,
        userId,
        user.name,
        title || null,
        vibeLower, // Store lowercase vibe
        budget_level,
        selectedFairnessMode,
        privacy_mode !== false, // Default to true if not specified
        'pending',
        'pending',
        expiresAt,
        proposed_date || null,
        proposed_time_start || null,
        proposed_time_end || null,
        is_time_flexible || false
      ]
    );

    const meetup = meetupResult.rows[0];

    // Insert creator as first participant
    console.log(`[Meetup Debug] Storing participant with transit_mode: ${selectedTransitMode}`);
    console.log(`[Meetup Debug] Creator location coordinates: lat=${creator_location.lat}, lng=${creator_location.lng}`);
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
        proposed_date,
        proposed_time_start,
        proposed_time_end,
        is_time_flexible,
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
 * GET /api/meetups/:shareableCode/invitation
 * View invitation details (PUBLIC - no auth required)
 * 
 * Returns invitation details for unauthenticated users to view before deciding to register/login
 * 
 * Response: {
 *   success: true,
 *   meetup_id: number,
 *   meetup_datetime: string (ISO format),
 *   vibe: string,
 *   status: string,
 *   creator: {
 *     name: string
 *   },
 *   creator_preferences: {
 *     budget_level: string,
 *     fairness_mode: string,
 *     transit_mode: string,
 *     location: object OR null  // Only include if privacy_mode is false
 *   }
 * }
 */
router.get('/:shareableCode/invitation', async (req, res) => {
  const { shareableCode } = req.params;

  try {
    const pool = req.app.locals.pool;

    // Get meetup details with creator info and preferences
    const meetupResult = await pool.query(
      `SELECT 
        m.id,
        m.meetup_code,
        m.meetup_vibe,
        m.budget_level,
        m.fairness_mode,
        m.global_privacy,
        m.status,
        m.created_at,
        m.proposed_date,
        m.proposed_time_start,
        m.proposed_time_end,
        m.is_time_flexible,
        u.name as creator_name,
        mp.location_name,
        mp.location_lat,
        mp.location_lng,
        mp.transit_mode
      FROM meetups m
      LEFT JOIN users u ON m.created_by = u.id
      LEFT JOIN meetup_participants mp ON m.id = mp.meetup_id AND mp.user_id = m.created_by
      WHERE m.meetup_code = $1`,
      [shareableCode.toUpperCase()]
    );

    if (meetupResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Invitation not found' 
      });
    }

    const meetup = meetupResult.rows[0];

    // Check if invitation is still pending
    if (meetup.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        error: 'This invitation has already been accepted or is no longer available' 
      });
    }

    // Build creator preferences object with privacy handling
    const creatorPreferences = {
      budget_level: meetup.budget_level,
      fairness_mode: meetup.fairness_mode,
      transit_mode: meetup.transit_mode || 'walking', // Default if not found
      location: null
    };

    // Include location only if privacy_mode is false
    if (!meetup.global_privacy && meetup.location_name && meetup.location_lat !== null && meetup.location_lng !== null) {
      creatorPreferences.location = {
        name: meetup.location_name,
        lat: meetup.location_lat,
        lng: meetup.location_lng
      };
    }

    res.status(200).json({
      success: true,
      meetup_id: meetup.id,
      meetup_datetime: meetup.created_at.toISOString(), // Use created_at as meetup datetime
      vibe: meetup.meetup_vibe,
      status: meetup.status,
      proposed_date: meetup.proposed_date,
      proposed_time_start: meetup.proposed_time_start,
      proposed_time_end: meetup.proposed_time_end,
      is_time_flexible: meetup.is_time_flexible,
      creator: {
        name: meetup.creator_name
      },
      creator_preferences: creatorPreferences
    });

  } catch (error) {
    console.error('Error fetching invitation details:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch invitation details' 
    });
  }
});

/**
 * POST /api/meetups/code/:meetupCode/join
 * Join a meetup (PUBLIC - no auth required)
 * 
 * Request body: {
 *   name: string,
 *   location: { name: string, lat: number, lng: number },
 *   transit_mode: "walking"|"driving"|"transit"|"bicycling" (case-insensitive)
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

    // Validate transit_mode (case-insensitive)
    const validTransitModes = ['walking', 'driving', 'transit', 'bicycling'];
    const selectedTransitMode = (transit_mode || 'walking').toLowerCase();
    if (!validTransitModes.includes(selectedTransitMode)) {
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

/**
 * POST /api/meetups/:shareableId/accept
 * Accept a meetup invitation (AUTHENTICATED)
 * 
 * Request: authenticated user joins the meetup
 * Response: success with meetup ID
 */
router.post('/:shareableId/accept', authenticateToken, async (req, res) => {
  const { shareableId } = req.params;
  const userId = req.user.userId;

  try {
    const pool = req.app.locals.pool;

    // Get user details
    const userResult = await pool.query(
      'SELECT id, name FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Find meetup by shareable ID (meetup_code)
    const meetupResult = await pool.query(
      'SELECT id, status FROM meetups WHERE meetup_code = $1',
      [shareableId.toUpperCase()]
    );

    if (meetupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    const meetup = meetupResult.rows[0];

    // Check if meetup is already accepted or beyond
    if (meetup.status !== 'pending') {
      return res.status(400).json({ error: `Meetup cannot be accepted. Current status: ${meetup.status}` });
    }

    // Count current participants
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM meetup_participants WHERE meetup_id = $1',
      [meetup.id]
    );

    const currentCount = parseInt(countResult.rows[0].count);

    // Check if meetup is full (should be 1 creator already)
    if (currentCount >= 2) {
      return res.status(400).json({ error: 'Meetup is full' });
    }

    // Check if user is already a participant
    const existingParticipant = await pool.query(
      'SELECT id FROM meetup_participants WHERE meetup_id = $1 AND user_id = $2',
      [meetup.id, userId]
    );

    if (existingParticipant.rows.length > 0) {
      return res.status(400).json({ error: 'You have already joined this meetup' });
    }

    // Get creator's location to use as default for joiner (they'll update later)
    const creatorParticipant = await pool.query(
      'SELECT location_name, location_lat, location_lng FROM meetup_participants WHERE meetup_id = $1 AND user_id IS NOT NULL ORDER BY joined_at LIMIT 1',
      [meetup.id]
    );

    let locationName = 'To be specified';
    let locationLat = 0;
    let locationLng = 0;

    if (creatorParticipant.rows.length > 0) {
      locationName = creatorParticipant.rows[0].location_name;
      locationLat = creatorParticipant.rows[0].location_lat;
      locationLng = creatorParticipant.rows[0].location_lng;
    }

    // Insert joiner as participant
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
        locationName,
        locationLat,
        locationLng,
        'walking', // Default transit mode, will be updated when preferences are set
        false
      ]
    );

    // Update meetup status to 'accepted'
    await pool.query(
      `UPDATE meetups
       SET status = 'accepted'
       WHERE id = $1`,
      [meetup.id]
    );

    res.status(200).json({
      success: true,
      meetup_id: meetup.id,
      message: 'Successfully joined the meetup'
    });

  } catch (error) {
    console.error('Error accepting meetup:', error);
    res.status(500).json({ error: 'Failed to accept meetup invitation' });
  }
});

/**
 * POST /api/meetups/:id/joiner-preferences
 * Submit joiner preferences (AUTHENTICATED)
 * 
 * Request body: {
 *   budget: "€"|"€€"|"€€€",
 *   fairness: "fastest"|"sustainable"|"accessible" (case-insensitive),
 *   location: { name: string, lat: number, lng: number },
 *   transport: "walking"|"driving"|"transit"|"bicycling" (case-insensitive)
 * }
 */
router.post('/:id/joiner-preferences', authenticateToken, async (req, res) => {
  const meetupId = req.params.id;
  const userId = req.user.userId;
  const { budget, fairness, location, transport } = req.body;

  try {
    const pool = req.app.locals.pool;

    // Validate required fields
    if (!budget || !fairness || !location || !transport) {
      return res.status(400).json({ error: 'Missing required fields: budget, fairness, location, transport' });
    }

    if (!location.name || location.lat === undefined || location.lng === undefined) {
      return res.status(400).json({ error: 'location must include name, lat, and lng' });
    }

    // Validate budget
    const validBudgets = ['€', '€€', '€€€'];
    if (!validBudgets.includes(budget)) {
      return res.status(400).json({ error: `Invalid budget. Must be one of: ${validBudgets.join(', ')}` });
    }

    // Validate fairness (case-insensitive)
    const validFairnessModes = ['fastest', 'sustainable', 'accessible'];
    const fairnessLower = fairness.toLowerCase();
    if (!validFairnessModes.includes(fairnessLower)) {
      return res.status(400).json({ error: `Invalid fairness. Must be one of: ${validFairnessModes.join(', ')}` });
    }

    // Validate transport (case-insensitive)
    const validTransitModes = ['walking', 'driving', 'transit', 'bicycling'];
    const transportLower = transport.toLowerCase();
    if (!validTransitModes.includes(transportLower)) {
      return res.status(400).json({ error: `Invalid transport. Must be one of: ${validTransitModes.join(', ')}` });
    }

    // Check if meetup exists and user is a participant
    const meetupResult = await pool.query(
      `SELECT m.id, m.status, mp.id as participant_id
       FROM meetups m
       LEFT JOIN meetup_participants mp ON m.id = mp.meetup_id AND mp.user_id = $1
       WHERE m.id = $2`,
      [userId, meetupId]
    );

    if (meetupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    const meetup = meetupResult.rows[0];

    if (!meetup.participant_id) {
      return res.status(403).json({ error: 'You are not a participant in this meetup' });
    }

    if (meetup.status !== 'accepted') {
      return res.status(400).json({ error: `Meetup cannot accept preferences. Current status: ${meetup.status}` });
    }

    // Update joiner's participant record with preferences
    await pool.query(
      `UPDATE meetup_participants
       SET location_name = $1,
           location_lat = $2,
           location_lng = $3,
           transit_mode = $4,
           updated_at = NOW()
       WHERE meetup_id = $5 AND user_id = $6`,
      [
        location.name,
        location.lat,
        location.lng,
        transportLower,
        meetupId,
        userId
      ]
    );

    // Update meetup status to 'preferences_set'
    await pool.query(
      `UPDATE meetups
       SET status = 'preferences_set'
       WHERE id = $1`,
      [meetupId]
    );

    // Get all participants for calculation
    const participantsResult = await pool.query(
      `SELECT
        participant_name,
        location_name,
        location_lat,
        location_lng,
        transit_mode
      FROM meetup_participants
      WHERE meetup_id = $1`,
      [meetupId]
    );

    const participants = participantsResult.rows;

    if (participants.length < 2) {
      return res.status(400).json({ error: 'Not enough participants for calculation' });
    }

    // Get meetup details for calculation
    const meetupDetails = await pool.query(
      `SELECT meetup_vibe, budget_level, fairness_mode, meetup_code
       FROM meetups WHERE id = $1`,
      [meetupId]
    );

    if (meetupDetails.rows.length === 0) {
      return res.status(404).json({ error: 'Meetup details not found' });
    }

    const meetupInfo = meetupDetails.rows[0];

    // Import calculation functions
    const { calculateFairness, calculateMidpoint } = require('../utils/fairnessCalculator');
    const { MOCK_VENUES } = require('../data/mocks/mockVenueData');

    // Filter venues by budget
    function filterVenuesByBudget(venues, budgetLevel) {
      const budgetMap = {
        '€': [1],
        '€€': [1, 2],
        '€€€': [1, 2, 3, 4]
      };

      const allowedPriceLevels = budgetMap[budgetLevel] || [1, 2];

      return venues.filter(venue => {
        const priceLevel = venue.priceLevel || 1;
        return allowedPriceLevels.includes(priceLevel);
      });
    }

    // Calculate midpoint
    const midpoint = calculateMidpoint(participants);

    // Filter venues by budget
    let filteredVenues = filterVenuesByBudget(MOCK_VENUES, meetupInfo.budget_level);

    // Apply fairness algorithm
    let calculatedVenues;
    try {
      calculatedVenues = calculateFairness(
        filteredVenues,
        participants,
        meetupInfo.fairness_mode
      );
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    // Limit to top 20 venues
    const topVenues = calculatedVenues.slice(0, 20);

    // Store results in database
    await pool.query(
      `UPDATE meetups
      SET
        calculated_midpoint_lat = $1,
        calculated_midpoint_lng = $2,
        calculated_venues = $3,
        calculation_status = 'ready'
      WHERE id = $4`,
      [
        midpoint.lat,
        midpoint.lng,
        JSON.stringify(topVenues),
        meetupId
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Preferences saved and venues calculated',
      venues_calculated: topVenues.length,
      meetup_status: 'preferences_set',
      meetup_code: meetupInfo.meetup_code
    });

  } catch (error) {
    console.error('Error saving joiner preferences:', error);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

/**
 * GET /api/meetups/:id/lobby
 * Get lobby data for meetup (AUTHENTICATED)
 * 
 * Note: :id can be either numeric ID or meetup code (e.g., "BNVKX8")
 * 
 * Response: {
 *   participants: [user info],
 *   creator_preferences: { ... },
 *   joiner_preferences: { ... },
 *   top_venues: [top 3 venues],
 *   comments: [all comments]
 * }
 */
router.get('/:id/lobby', authenticateToken, async (req, res) => {
  const idOrCode = req.params.id;
  const userId = req.user.userId;

  try {
    console.log(`[LOBBY DEBUG] Request for idOrCode: ${idOrCode}, userId: ${userId}`);
    const pool = req.app.locals.pool;

    // Resolve the actual numeric meetup ID (handles both numeric ID and meetup code)
    const actualMeetupId = await resolveMeetupId(pool, idOrCode);
    
    if (!actualMeetupId) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    // Check if user is a participant
    const participantCheck = await pool.query(
      'SELECT id FROM meetup_participants WHERE meetup_id = $1 AND user_id = $2',
      [actualMeetupId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a participant in this meetup' });
    }

    // Get meetup details
    const meetupResult = await pool.query(
      `SELECT
        id,
        meetup_code,
        meetup_title,
        meetup_vibe,
        budget_level,
        fairness_mode,
        global_privacy,
        status,
        calculated_venues,
        created_by,
        proposed_date,
        proposed_time_start,
        proposed_time_end,
        is_time_flexible
      FROM meetups
      WHERE id = $1`,
      [actualMeetupId]
    );

    if (meetupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    const meetup = meetupResult.rows[0];

    // Check if meetup is in correct status
    if (!['preferences_set', 'confirmed'].includes(meetup.status)) {
      return res.status(400).json({ error: `Lobby not available. Current status: ${meetup.status}` });
    }

    // Get all participants
    const participantsResult = await pool.query(
      `SELECT
        mp.id,
        mp.user_id,
        mp.participant_name,
        mp.location_name,
        mp.location_lat,
        mp.location_lng,
        mp.transit_mode,
        mp.is_private,
        u.email
      FROM meetup_participants mp
      LEFT JOIN users u ON mp.user_id = u.id
      WHERE mp.meetup_id = $1
      ORDER BY mp.joined_at ASC`,
      [actualMeetupId]
    );

    const participants = participantsResult.rows;

    if (participants.length < 2) {
      return res.status(400).json({ error: 'Not enough participants' });
    }

    const creator = participants[0];
    const joiner = participants[1];

    // Apply privacy mode
    const applyPrivacy = (participant) => {
      if (meetup.global_privacy && participant.is_private) {
        return {
          ...participant,
          location_name: 'Location hidden',
          location_lat: null,
          location_lng: null
        };
      }
      return participant;
    };

    const sanitizedCreator = applyPrivacy(creator);
    const sanitizedJoiner = applyPrivacy(joiner);

    // Get top venues
    const topVenues = meetup.calculated_venues || [];

    // Get comments
    const commentsResult = await pool.query(
      `SELECT
        mc.id,
        mc.user_id,
        mc.comment,
        mc.created_at,
        u.name as user_name
      FROM meetup_comments mc
      LEFT JOIN users u ON mc.user_id = u.id
      WHERE mc.meetup_id = $1
      ORDER BY mc.created_at ASC`,
      [actualMeetupId]
    );

    const comments = commentsResult.rows;

    res.status(200).json({
      success: true,
      meetup: {
        id: meetup.id,
        code: meetup.meetup_code,
        title: meetup.meetup_title,
        vibe: meetup.meetup_vibe,
        status: meetup.status,
        proposed_date: meetup.proposed_date,
        proposed_time_start: meetup.proposed_time_start,
        proposed_time_end: meetup.proposed_time_end,
        is_time_flexible: meetup.is_time_flexible
      },
      participants: {
        creator: {
          id: sanitizedCreator.user_id,
          name: sanitizedCreator.participant_name,
          email: sanitizedCreator.email,
          location: {
            name: sanitizedCreator.location_name,
            lat: sanitizedCreator.location_lat,
            lng: sanitizedCreator.location_lng
          },
          transport: sanitizedCreator.transit_mode
        },
        joiner: {
          id: sanitizedJoiner.user_id,
          name: sanitizedJoiner.participant_name,
          email: sanitizedJoiner.email,
          location: {
            name: sanitizedJoiner.location_name,
            lat: sanitizedJoiner.location_lat,
            lng: sanitizedJoiner.location_lng
          },
          transport: sanitizedJoiner.transit_mode
        }
      },
      preferences: {
        budget: meetup.budget_level,
        fairness: meetup.fairness_mode
      },
      top_venues: topVenues,
      comments: comments
    });

  } catch (error) {
    console.error('Error fetching lobby data:', error);
    res.status(500).json({ error: 'Failed to fetch lobby data' });
  }
});

/**
 * POST /api/meetups/:id/comments
 * Add a comment to meetup (AUTHENTICATED)
 * 
 * Request body: { comment: string }
 */
router.post('/:id/comments', authenticateToken, async (req, res) => {
  const idOrCode = req.params.id;
  const userId = req.user.userId;
  const { comment } = req.body;

  try {
    const pool = req.app.locals.pool;

    // Resolve the actual numeric meetup ID
    const meetupId = await resolveMeetupId(pool, idOrCode);
    
    if (!meetupId) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    // Validate comment
    if (!comment || comment.trim() === '') {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    // Check if user is a participant
    const participantCheck = await pool.query(
      'SELECT id FROM meetup_participants WHERE meetup_id = $1 AND user_id = $2',
      [meetupId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a participant in this meetup' });
    }

    // Insert comment
    const result = await pool.query(
      `INSERT INTO meetup_comments (meetup_id, user_id, comment, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, comment, created_at`,
      [meetupId, userId, comment.trim()]
    );

    const newComment = result.rows[0];

    // Get user name for response
    const userResult = await pool.query(
      'SELECT name FROM users WHERE id = $1',
      [userId]
    );

    const userName = userResult.rows[0]?.name || 'Unknown';

    res.status(201).json({
      success: true,
      comment: {
        id: newComment.id,
        user_id: userId,
        user_name: userName,
        comment: newComment.comment,
        created_at: newComment.created_at
      }
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

/**
 * GET /api/meetups/:id/comments
 * Get all comments for meetup (AUTHENTICATED)
 */
router.get('/:id/comments', authenticateToken, async (req, res) => {
  const idOrCode = req.params.id;
  const userId = req.user.userId;

  try {
    const pool = req.app.locals.pool;

    // Resolve the actual numeric meetup ID
    const meetupId = await resolveMeetupId(pool, idOrCode);
    
    if (!meetupId) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    // Check if user is a participant
    const participantCheck = await pool.query(
      'SELECT id FROM meetup_participants WHERE meetup_id = $1 AND user_id = $2',
      [meetupId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a participant in this meetup' });
    }

    // Get all comments
    const commentsResult = await pool.query(
      `SELECT
        mc.id,
        mc.user_id,
        mc.comment,
        mc.created_at,
        u.name as user_name
      FROM meetup_comments mc
      LEFT JOIN users u ON mc.user_id = u.id
      WHERE mc.meetup_id = $1
      ORDER BY mc.created_at ASC`,
      [meetupId]
    );

    const comments = commentsResult.rows;

    res.status(200).json({
      success: true,
      comments: comments
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

/**
 * POST /api/meetups/:code/vote
 * Record a user's vote for a venue
 */
router.post('/:code/vote', authenticateToken, async (req, res) => {
  const { code } = req.params;
  const { venue_id } = req.body;
  const userId = req.user.userId;

  if (!venue_id) {
    return res.status(400).json({ error: 'venue_id is required' });
  }

  try {
    const pool = req.app.locals.pool;

    // Resolve meetup ID from code
    const meetupId = await resolveMeetupId(pool, code);
    if (!meetupId) {
      console.error('[VOTE] Meetup not found:', code);
      return res.status(404).json({ error: 'Meetup not found' });
    }

    // Check if user is a participant
    const participantCheck = await pool.query(
      'SELECT id FROM meetup_participants WHERE meetup_id = $1 AND user_id = $2',
      [meetupId, userId]
    );

    if (participantCheck.rows.length === 0) {
      console.error('[VOTE] User is not a participant');
      return res.status(403).json({ error: 'You are not a participant in this meetup' });
    }

    // Insert or update vote (UPSERT)
    const result = await pool.query(
      `INSERT INTO meetup_venue_votes (meetup_id, user_id, venue_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (meetup_id, user_id)
       DO UPDATE SET venue_id = $3, voted_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [meetupId, userId, venue_id]
    );

    console.log(`[VOTE] User ${userId} voted for venue ${venue_id}`);

    // AUTO-CONFIRMATION: Check if both participants voted for the same venue
    const allVotesResult = await pool.query(
      `SELECT user_id, venue_id FROM meetup_venue_votes WHERE meetup_id = $1`,
      [meetupId]
    );

    const votes = allVotesResult.rows;
    console.log(`[VOTE AUTO-CONFIRM] Checking votes for meetup ${meetupId}:`, votes);

    // Check if we have exactly 2 votes (both participants voted)
    if (votes.length === 2) {
      const venue1 = votes[0].venue_id;
      const venue2 = votes[1].venue_id;
      
      // Check if both voted for the same venue
      if (venue1 === venue2) {
        console.log(`[VOTE AUTO-CONFIRM] Both users voted for venue ${venue1} - auto-confirming meetup`);
        
        // Update meetup status to confirmed
        await pool.query(
          `UPDATE meetups SET status = 'confirmed' WHERE id = $1`,
          [meetupId]
        );
        
        console.log(`[VOTE AUTO-CONFIRM] Meetup ${meetupId} auto-confirmed with venue ${venue1}`);
        
        // Return response indicating auto-confirmation
        return res.json({ 
          success: true, 
          message: 'Vote recorded and meetup auto-confirmed!',
          auto_confirmed: true,
          confirmed_venue: venue1,
          vote: result.rows[0] 
        });
      } else {
        console.log(`[VOTE AUTO-CONFIRM] Votes don't match - venue ${venue1} vs ${venue2}`);
      }
    } else {
      console.log(`[VOTE AUTO-CONFIRM] Only ${votes.length} vote(s) recorded - waiting for second participant`);
    }

    // If not auto-confirmed, return standard success response
    res.json({ success: true, message: 'Vote recorded', vote: result.rows[0] });

  } catch (error) {
    console.error('[VOTE] Error recording vote:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

/**
 * GET /api/meetups/:code/votes
 * Get all votes for a meetup
 */
router.get('/:code/votes', authenticateToken, async (req, res) => {
  const { code } = req.params;

  try {
    const pool = req.app.locals.pool;

    // Resolve meetup ID from code
    const meetupId = await resolveMeetupId(pool, code);
    if (!meetupId) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    // Get all votes with user info
    const votesResult = await pool.query(
      `SELECT 
        v.venue_id, 
        v.voted_at, 
        u.name as voter_name, 
        u.id as voter_id
       FROM meetup_venue_votes v
       JOIN users u ON v.user_id = u.id
       WHERE v.meetup_id = $1
       ORDER BY v.voted_at DESC`,
      [meetupId]
    );

    res.json({ votes: votesResult.rows });

  } catch (error) {
    console.error('[VOTES] Error fetching votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

/**
 * POST /api/meetups/:id/confirm
 * Confirm meetup venue (AUTHENTICATED)
 * 
 * Request: empty body, just authentication
 * Response: success with updated status
 */
router.post('/:id/confirm', authenticateToken, async (req, res) => {
  const idOrCode = req.params.id;
  const userId = req.user.userId;

  try {
    const pool = req.app.locals.pool;

    // Resolve the actual numeric meetup ID
    const meetupId = await resolveMeetupId(pool, idOrCode);
    
    if (!meetupId) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    // Check if user is a participant
    const participantCheck = await pool.query(
      'SELECT id FROM meetup_participants WHERE meetup_id = $1 AND user_id = $2',
      [meetupId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a participant in this meetup' });
    }

    // Get meetup details
    const meetupResult = await pool.query(
      `SELECT id, status, calculated_venues
       FROM meetups WHERE id = $1`,
      [meetupId]
    );

    if (meetupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    const meetup = meetupResult.rows[0];

    // Check if meetup is in correct status
    if (meetup.status !== 'preferences_set') {
      return res.status(400).json({ error: `Meetup cannot be confirmed. Current status: ${meetup.status}` });
    }

    // Check if venues have been calculated
    if (!meetup.calculated_venues || meetup.calculated_venues.length === 0) {
      return res.status(400).json({ error: 'No venues calculated yet' });
    }

    // Update meetup status to 'confirmed'
    await pool.query(
      `UPDATE meetups
       SET status = 'confirmed'
       WHERE id = $1`,
      [meetupId]
    );

    res.status(200).json({
      success: true,
      message: 'Meetup confirmed successfully',
      meetup_status: 'confirmed'
    });

  } catch (error) {
    console.error('Error confirming meetup:', error);
    res.status(500).json({ error: 'Failed to confirm meetup' });
  }
});

/**
 * GET /api/meetups/:id/info
 * Get basic meetup info (AUTHENTICATED)
 */
router.get('/:id/info', authenticateToken, async (req, res) => {
  const idOrCode = req.params.id;

  try {
    const pool = req.app.locals.pool;

    // Resolve the actual numeric meetup ID
    const meetupId = await resolveMeetupId(pool, idOrCode);
    
    if (!meetupId) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    const meetupResult = await pool.query(
      `SELECT id, meetup_code, meetup_vibe, created_at
       FROM meetups WHERE id = $1`,
      [meetupId]
    );

    if (meetupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    const meetup = meetupResult.rows[0];

    res.status(200).json({
      id: meetup.id,
      meetup_code: meetup.meetup_code,
      vibe: meetup.meetup_vibe,
      meetup_datetime: meetup.created_at
    });

  } catch (error) {
    console.error('Error fetching meetup info:', error);
    res.status(500).json({ error: 'Failed to fetch meetup info' });
  }
});

/**
 * GET /api/meetups/history
 * Get user's meetup history (both as organizer and participant)
 * Query param: ?filter=all|active|past (default: all)
 * Active = status != 'completed' AND expires_at > NOW()
 * Include: meetup basic info, participant count, confirmed venue if exists
 * Order by created_at DESC
 * Return array of meetup objects with participant_count field
 */
router.get('/history', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const filter = req.query.filter || 'all';

  try {
    let whereClause = '';
    let queryParams = [userId];

    if (filter === 'active') {
      whereClause = `AND m.status != 'completed' AND m.expires_at > NOW()`;
    } else if (filter === 'past') {
      whereClause = `AND (m.status = 'completed' OR m.expires_at <= NOW())`;
    }
    // 'all' includes all meetups, no additional filter

    const query = `
      SELECT 
        m.id,
        m.meetup_code,
        m.meetup_title,
        m.meetup_vibe,
        m.budget_level,
        m.fairness_mode,
        m.status,
        m.created_at,
        m.expires_at,
        m.proposed_date,
        m.proposed_time_start,
        m.proposed_time_end,
        m.is_time_flexible,
        COUNT(DISTINCT mp.id) as participant_count,
        CASE 
          WHEN m.created_by = $1 THEN 'organizer'
          ELSE 'participant'
        END as user_role
      FROM meetups m
      JOIN meetup_participants mp ON m.id = mp.meetup_id
      WHERE mp.user_id = $1
        ${whereClause}
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `;

    const result = await pool.query(query, queryParams);

    const meetups = result.rows.map(meetup => ({
      id: meetup.id,
      meetup_code: meetup.meetup_code,
      title: meetup.meetup_title,
      vibe: meetup.meetup_vibe,
      budget_level: meetup.budget_level,
      fairness_mode: meetup.fairness_mode,
      status: meetup.status,
      created_at: meetup.created_at,
      expires_at: meetup.expires_at,
      proposed_date: meetup.proposed_date,
      proposed_time_start: meetup.proposed_time_start,
      proposed_time_end: meetup.proposed_time_end,
      is_time_flexible: meetup.is_time_flexible,
      participant_count: parseInt(meetup.participant_count),
      user_role: meetup.user_role
    }));

    res.json(meetups);

  } catch (error) {
    console.error('Error fetching meetup history:', error);
    res.status(500).json({ error: 'Failed to fetch meetup history' });
  }
});

/**
 * GET /api/meetups/:id/messages
 * Get chat message history for a specific meetup
 * Verify user is participant or organizer
 * Query params: ?limit=50&offset=0 (pagination)
 * Order by created_at ASC (oldest first)
 * Return: { messages: [...], total: X, hasMore: boolean }
 */
router.get('/:id/messages', authenticateToken, async (req, res) => {
  const idOrCode = req.params.id;
  const userId = req.user.userId;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const pool = req.app.locals.pool;

    // Resolve the actual numeric meetup ID
    const meetupId = await resolveMeetupId(pool, idOrCode);
    
    if (!meetupId) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    // Check if user is a participant
    const participantCheck = await pool.query(
      'SELECT id FROM meetup_participants WHERE meetup_id = $1 AND user_id = $2',
      [meetupId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a participant in this meetup' });
    }

    // Get total count of messages
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM meetup_messages WHERE meetup_id = $1',
      [meetupId]
    );

    const total = parseInt(countResult.rows[0].total);

    // Get paginated messages
    const messagesResult = await pool.query(
      `SELECT 
        mm.id,
        mm.meetup_id,
        mm.user_id,
        mm.user_name,
        mm.message,
        mm.message_type,
        mm.created_at
      FROM meetup_messages mm
      WHERE mm.meetup_id = $1
      ORDER BY mm.created_at ASC
      LIMIT $2 OFFSET $3`,
      [meetupId, limit, offset]
    );

    const messages = messagesResult.rows;

    res.json({
      messages: messages,
      total: total,
      hasMore: (offset + messages.length) < total,
      limit: limit,
      offset: offset
    });

  } catch (error) {
    console.error('Error fetching meetup messages:', error);
    res.status(500).json({ error: 'Failed to fetch meetup messages' });
  }
});

module.exports = router;
