const express = require('express');
const router = express.Router();
const { calculateFairness, calculateMidpoint } = require('../utils/fairnessCalculator');
const { MOCK_VENUES } = require('./mockVenueData');

/**
 * Generate a unique 6-character meetup code
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
 * Filter venues by budget level
 */
function filterVenuesByBudget(venues, budgetLevel) {
  const budgetMap = {
    'budget': [1],
    'mid': [1, 2],
    'treat': [1, 2, 3, 4]
  };

  const allowedPriceLevels = budgetMap[budgetLevel] || [1, 2];

  return venues.filter(venue => {
    const priceLevel = venue.priceLevel || 1;
    return allowedPriceLevels.includes(priceLevel);
  });
}

/**
 * POST /api/meetup/create-organized
 * Create a new organizer-led meetup
 */
router.post('/create-organized', async (req, res) => {
  const {
    created_by_name,
    meetup_title,
    meetup_vibe,
    budget_level,
    fairness_mode,
    max_travel_time,
    global_privacy
  } = req.body;

  try {
    const pool = req.app.locals.pool;

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
    const result = await pool.query(
      `INSERT INTO meetups (
        meetup_code,
        created_by_name,
        meetup_title,
        meetup_vibe,
        budget_level,
        fairness_mode,
        max_travel_time,
        global_privacy,
        status,
        calculation_status,
        expires_at,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING id, meetup_code`,
      [
        meetup_code,
        created_by_name,
        meetup_title,
        meetup_vibe,
        budget_level,
        fairness_mode || 'fastest',
        max_travel_time || 45,
        global_privacy !== false,
        'pending',
        'waiting',
        expiresAt
      ]
    );

    const meetup = result.rows[0];

    res.json({
      success: true,
      meetup_code: meetup.meetup_code,
      meetup_id: meetup.id,
      share_link: `/join/${meetup.meetup_code}`
    });

  } catch (error) {
    console.error('Error creating meetup:', error);
    res.status(500).json({ error: 'Failed to create meetup' });
  }
});

/**
 * POST /api/meetup/:code/join
 * Join a meetup as a participant
 */
router.post('/:code/join', async (req, res) => {
  const { code } = req.params;
  const {
    participant_name,
    location,
    latitude,
    longitude,
    transit_mode,
    is_private,
    needs_accessibility
  } = req.body;

  try {
    const pool = req.app.locals.pool;

    // Validate meetup exists and not expired
    const meetupResult = await pool.query(
      'SELECT id, expires_at FROM meetups WHERE meetup_code = $1',
      [code]
    );

    if (meetupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    const meetup = meetupResult.rows[0];

    // Check expiration
    if (new Date(meetup.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Meetup has expired' });
    }

    // Insert participant
    const participantResult = await pool.query(
      `INSERT INTO meetup_participants (
        meetup_id,
        participant_name,
        location_name,
        location_lat,
        location_lng,
        transit_mode,
        is_private,
        needs_accessibility,
        joined_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id`,
      [
        meetup.id,
        participant_name,
        location,
        latitude,
        longitude,
        transit_mode || 'WALKING',
        is_private || false,
        needs_accessibility || false
      ]
    );

    const participant_id = participantResult.rows[0].id;

    // Count participants
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM meetup_participants WHERE meetup_id = $1',
      [meetup.id]
    );

    const participantCount = parseInt(countResult.rows[0].count);

    // Update meetup status to active if we have 2+ participants
    if (participantCount >= 2) {
      await pool.query(
        'UPDATE meetups SET status = $1 WHERE id = $2',
        ['active', meetup.id]
      );
    }

    res.json({
      success: true,
      participant_id,
      meetup_code: code
    });

  } catch (error) {
    console.error('Error joining meetup:', error);
    res.status(500).json({ error: 'Failed to join meetup' });
  }
});

/**
 * GET /api/meetup/:code/lobby
 * Get meetup details and participants for lobby view
 */
router.get('/:code/lobby', async (req, res) => {
  const { code } = req.params;

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
        max_travel_time,
        created_by_name,
        status,
        calculation_status,
        expires_at
      FROM meetups
      WHERE meetup_code = $1`,
      [code]
    );

    if (meetupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    const meetup = meetupResult.rows[0];

    // Check expiration
    if (new Date(meetup.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Meetup has expired' });
    }

    // Get all participants
    const participantsResult = await pool.query(
      `SELECT
        id,
        participant_name,
        location_name,
        location_lat,
        location_lng,
        transit_mode,
        is_private,
        joined_at
      FROM meetup_participants
      WHERE meetup_id = $1
      ORDER BY joined_at ASC`,
      [meetup.id]
    );

    // Sanitize private participants
    const participants = participantsResult.rows.map(p => ({
      id: p.id,
      participant_name: p.participant_name,
      location_name: p.is_private ? 'Location hidden' : p.location_name,
      location_lat: p.is_private ? null : p.location_lat,
      location_lng: p.is_private ? null : p.location_lng,
      transit_mode: p.transit_mode,
      joined_at: p.joined_at
    }));

    const participantCount = participants.length;
    const readyToCalculate = participantCount >= 2;

    res.json({
      success: true,
      meetup: {
        code: meetup.meetup_code,
        title: meetup.meetup_title,
        vibe: meetup.meetup_vibe,
        budget_level: meetup.budget_level,
        fairness_mode: meetup.fairness_mode,
        max_travel_time: meetup.max_travel_time,
        created_by_name: meetup.created_by_name,
        status: meetup.status,
        calculation_status: meetup.calculation_status
      },
      participants,
      participant_count: participantCount,
      ready_to_calculate: readyToCalculate,
      is_organizer: false // Frontend should determine this based on name match
    });

  } catch (error) {
    console.error('Error fetching lobby:', error);
    res.status(500).json({ error: 'Failed to fetch lobby data' });
  }
});

/**
 * POST /api/meetup/:code/calculate
 * Calculate fair venues (organizer only)
 */
router.post('/:code/calculate', async (req, res) => {
  const { code } = req.params;
  const { organizer_name } = req.body;

  try {
    const pool = req.app.locals.pool;

    // Get meetup and verify organizer
    const meetupResult = await pool.query(
      `SELECT
        id,
        created_by_name,
        meetup_vibe,
        budget_level,
        fairness_mode,
        max_travel_time
      FROM meetups
      WHERE meetup_code = $1`,
      [code]
    );

    if (meetupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    const meetup = meetupResult.rows[0];

    // Verify organizer
    if (meetup.created_by_name !== organizer_name) {
      return res.status(403).json({ error: 'Only the organizer can calculate venues' });
    }

    // Get all participants with REAL coordinates (not sanitized)
    const participantsResult = await pool.query(
      `SELECT
        participant_name,
        location_name,
        location_lat,
        location_lng,
        transit_mode
      FROM meetup_participants
      WHERE meetup_id = $1`,
      [meetup.id]
    );

    const participants = participantsResult.rows;

    if (participants.length < 2) {
      return res.status(400).json({ error: 'At least 2 participants required' });
    }

    // Calculate midpoint
    const midpoint = calculateMidpoint(participants);

    // Filter venues by budget
    let filteredVenues = filterVenuesByBudget(MOCK_VENUES, meetup.budget_level);

    // Apply fairness algorithm
    let calculatedVenues;
    try {
      calculatedVenues = calculateFairness(
        filteredVenues,
        participants,
        meetup.fairness_mode
      );
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    // Filter by max travel time
    calculatedVenues = calculatedVenues.filter(
      v => v.maxTravelTime <= meetup.max_travel_time
    );

    // Limit to top 10
    const topVenues = calculatedVenues.slice(0, 10);

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
        meetup.id
      ]
    );

    // Prepare fairness summary
    const fairnessSummary = {
      mode: meetup.fairness_mode,
      max_travel_time: topVenues.length > 0 ? topVenues[0].maxTravelTime : 0,
      participants_summary: topVenues.length > 0
        ? topVenues[0].travelTimes.map(t => ({
            name: t.personName,
            time: t.duration,
            mode: t.mode
          }))
        : []
    };

    res.json({
      success: true,
      midpoint,
      venues: topVenues,
      fairness_summary: fairnessSummary
    });

  } catch (error) {
    console.error('Error calculating venues:', error);
    res.status(500).json({ error: 'Failed to calculate venues' });
  }
});

/**
 * GET /api/meetup/:code/results
 * Get calculated results (anyone can access)
 */
router.get('/:code/results', async (req, res) => {
  const { code } = req.params;

  try {
    const pool = req.app.locals.pool;

    // Get meetup with calculated results
    const meetupResult = await pool.query(
      `SELECT
        id,
        meetup_code,
        fairness_mode,
        calculated_midpoint_lat,
        calculated_midpoint_lng,
        calculated_venues,
        calculation_status
      FROM meetups
      WHERE meetup_code = $1`,
      [code]
    );

    if (meetupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    const meetup = meetupResult.rows[0];

    if (meetup.calculation_status !== 'ready') {
      return res.status(400).json({ error: 'Results not yet calculated' });
    }

    const venues = meetup.calculated_venues || [];

    const midpoint = {
      lat: parseFloat(meetup.calculated_midpoint_lat),
      lng: parseFloat(meetup.calculated_midpoint_lng)
    };

    // Prepare fairness summary
    const fairnessSummary = {
      mode: meetup.fairness_mode,
      max_travel_time: venues.length > 0 ? venues[0].maxTravelTime : 0,
      participants_summary: venues.length > 0
        ? venues[0].travelTimes.map(t => ({
            name: t.personName,
            time: t.duration,
            mode: t.mode
          }))
        : []
    };

    res.json({
      success: true,
      midpoint,
      venues,
      fairness_summary: fairnessSummary
    });

  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

/**
 * POST /api/meetup/:code/confirm
 * Confirm a venue selection (organizer only)
 */
router.post('/:code/confirm', async (req, res) => {
  const { code } = req.params;
  const { organizer_name, venue_id, venue_name } = req.body;

  try {
    const pool = req.app.locals.pool;

    // Get meetup and verify organizer
    const meetupResult = await pool.query(
      'SELECT id, created_by_name FROM meetups WHERE meetup_code = $1',
      [code]
    );

    if (meetupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    const meetup = meetupResult.rows[0];

    // Verify organizer
    if (meetup.created_by_name !== organizer_name) {
      return res.status(403).json({ error: 'Only the organizer can confirm venue' });
    }

    // Update meetup with confirmed venue
    await pool.query(
      `UPDATE meetups
      SET
        confirmed_venue_id = $1,
        confirmed_venue_name = $2,
        confirmed_at = NOW(),
        status = 'confirmed'
      WHERE id = $3`,
      [venue_id, venue_name, meetup.id]
    );

    res.json({
      success: true,
      confirmed_venue: {
        id: venue_id,
        name: venue_name
      }
    });

  } catch (error) {
    console.error('Error confirming venue:', error);
    res.status(500).json({ error: 'Failed to confirm venue' });
  }
});

/**
 * GET /api/meetup/:code/confirmed
 * Get confirmed venue details
 */
router.get('/:code/confirmed', async (req, res) => {
  const { code } = req.params;

  try {
    const pool = req.app.locals.pool;

    // Get meetup with confirmed venue
    const meetupResult = await pool.query(
      `SELECT
        id,
        meetup_code,
        meetup_title,
        meetup_vibe,
        confirmed_venue_id,
        confirmed_venue_name,
        confirmed_at,
        status,
        calculated_venues
      FROM meetups
      WHERE meetup_code = $1`,
      [code]
    );

    if (meetupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    const meetup = meetupResult.rows[0];

    if (meetup.status !== 'confirmed' || !meetup.confirmed_venue_id) {
      return res.status(400).json({ error: 'No venue confirmed yet' });
    }

    // Find full venue details from calculated venues
    const calculatedVenues = meetup.calculated_venues || [];
    const confirmedVenue = calculatedVenues.find(
      v => v.id === meetup.confirmed_venue_id
    );

    // Get all participants
    const participantsResult = await pool.query(
      `SELECT
        participant_name,
        location_name,
        transit_mode
      FROM meetup_participants
      WHERE meetup_id = $1
      ORDER BY joined_at ASC`,
      [meetup.id]
    );

    res.json({
      success: true,
      meetup: {
        code: meetup.meetup_code,
        title: meetup.meetup_title,
        vibe: meetup.meetup_vibe,
        confirmed_at: meetup.confirmed_at
      },
      confirmed_venue: confirmedVenue || {
        id: meetup.confirmed_venue_id,
        name: meetup.confirmed_venue_name
      },
      participants: participantsResult.rows
    });

  } catch (error) {
    console.error('Error fetching confirmed venue:', error);
    res.status(500).json({ error: 'Failed to fetch confirmed venue' });
  }
});

module.exports = router;
