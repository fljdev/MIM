/**
 * Carbon Tracking Routes
 * 
 * API endpoints for carbon emission tracking and reporting.
 * Tracks user journeys, calculates emissions, and provides statistics.
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { calculateCarbonEmission } = require('../utils/carbonCalculator');
const { calculateDistance } = require('../utils/mockDistanceCalculator');
const { 
  getCarbonContextData, 
  MODE_RECOMMENDATIONS,
  MOCK_GLOBAL_STATS 
} = require('../data/mocks/mockCarbonData');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Authentication middleware - verifies JWT token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log('[Auth Debug] Authorization header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[Auth Debug] No token or invalid format');
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  console.log('[Auth Debug] Token extracted (first 50 chars):', token.substring(0, 50) + '...');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[Auth Debug] Token decoded successfully. User ID:', decoded.userId, 'Email:', decoded.email);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('[Auth Debug] Token verification failed:', error.name, error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * POST /api/carbon/journey
 * Log a user's journey with carbon emission calculation
 * 
 * Request body: {
 *   meetup_id: number,
 *   origin: { lat: number, lng: number, name: string },
 *   destination: { lat: number, lng: number, name: string },
 *   mode_of_transport: "walking"|"driving"|"transit"|"bicycling"
 * }
 * 
 * Response: {
 *   success: true,
 *   journey: { distance_km, carbon_emitted, mode_of_transport },
 *   context: { message, icon, comparison }
 * }
 */
router.post('/journey', authenticateToken, async (req, res) => {
  const { meetup_id, origin, destination, mode_of_transport } = req.body;
  const userId = req.user.userId;

  try {
    const pool = req.app.locals.pool;

    // Validate required fields
    if (!meetup_id || !origin || !destination || !mode_of_transport) {
      return res.status(400).json({ 
        error: 'Missing required fields: meetup_id, origin, destination, mode_of_transport' 
      });
    }

    // Validate coordinates
    if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      return res.status(400).json({ 
        error: 'Origin and destination must include lat and lng' 
      });
    }

    // Validate mode of transport
    const validModes = ['walking', 'driving', 'transit', 'bicycling'];
    const modeLower = mode_of_transport.toLowerCase();
    if (!validModes.includes(modeLower)) {
      return res.status(400).json({ 
        error: `Invalid mode_of_transport. Must be one of: ${validModes.join(', ')}` 
      });
    }

    // Check if user is a participant in this meetup
    const participantCheck = await pool.query(
      'SELECT id FROM legacy_meetup_participants WHERE meetup_id = $1 AND user_id = $2',
      [meetup_id, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ 
        error: 'You are not a participant in this meetup' 
      });
    }

    // Calculate distance using Haversine formula
    const distanceKm = calculateDistance(
      origin.lat, 
      origin.lng, 
      destination.lat, 
      destination.lng
    );

    // Calculate carbon emissions
    const carbonEmitted = calculateCarbonEmission(distanceKm, modeLower);

    // Update participant record with distance and carbon data
    await pool.query(
      `UPDATE legacy_meetup_participants 
       SET distance_km = $1, 
           carbon_emitted = $2,
           transit_mode = $3,
           updated_at = NOW()
       WHERE meetup_id = $4 AND user_id = $5`,
      [distanceKm, carbonEmitted, modeLower, meetup_id, userId]
    );

    // Get context for the carbon emission
    const context = getCarbonContextData(carbonEmitted);

    // Get recommendation for the mode
    const recommendation = MODE_RECOMMENDATIONS[modeLower] || null;

    res.status(200).json({
      success: true,
      journey: {
        meetup_id: meetup_id,
        distance_km: distanceKm,
        carbon_emitted: carbonEmitted,
        mode_of_transport: modeLower,
        origin: origin.name || 'Origin',
        destination: destination.name || 'Destination'
      },
      context: {
        message: context.message,
        icon: context.icon,
        comparison: context.comparison
      },
      recommendation: recommendation
    });

  } catch (error) {
    console.error('Error logging journey:', error);
    res.status(500).json({ error: 'Failed to log journey' });
  }
});

/**
 * GET /api/carbon/user/:id
 * Get total carbon emissions and journey history for a user
 * 
 * Response: {
 *   user_id: number,
 *   total_carbon_kg: number,
 *   journey_count: number,
 *   average_per_journey: number,
 *   total_distance_km: number,
 *   journeys: [{ meetup_id, distance_km, mode, carbon_emitted, date }],
 *   by_mode: { mode: { count, emissions, distance } }
 * }
 */
router.get('/user/:id', authenticateToken, async (req, res) => {
  const targetUserId = parseInt(req.params.id);
  const requestingUserId = req.user.userId;

  console.log(`[Carbon API Debug] GET /api/carbon/user/${targetUserId} called by user ${requestingUserId}`);
  console.log(`[Carbon API Debug] Authentication check: ${targetUserId === requestingUserId ? 'PASS' : 'FAIL'}`);

  try {
    const pool = req.app.locals.pool;

    // Users can only view their own carbon data (privacy)
    if (targetUserId !== requestingUserId) {
      console.log(`[Carbon API Debug] Authorization failed: User ${requestingUserId} cannot access data for user ${targetUserId}`);
      return res.status(403).json({ 
        error: 'You can only view your own carbon emission data' 
      });
    }

    console.log(`[Carbon API Debug] Querying journeys for user ${targetUserId}`);
    // Get user's journey history from meetup_participants
    const journeysResult = await pool.query(
      `SELECT 
        mp.meetup_id,
        mp.distance_km,
        mp.transit_mode as mode,
        mp.carbon_emitted,
        mp.joined_at as date,
        m.meetup_title,
        m.meetup_vibe,
        m.meetup_code
      FROM legacy_meetup_participants mp
      LEFT JOIN legacy_meetups m ON mp.meetup_id = m.id
      WHERE mp.user_id = $1 AND mp.carbon_emitted IS NOT NULL
      ORDER BY mp.joined_at DESC`,
      [targetUserId]
    );

    const journeys = journeysResult.rows;
    console.log(`[Carbon API Debug] Query returned ${journeys.length} journeys for user ${targetUserId}`);
    
    // Log each journey found
    journeys.forEach((journey, index) => {
      console.log(`[Carbon API Debug] Journey ${index + 1}:`);
      console.log(`  - Meetup ID: ${journey.meetup_id}`);
      console.log(`  - Distance: ${journey.distance_km} km`);
      console.log(`  - Mode: ${journey.mode}`);
      console.log(`  - Carbon: ${journey.carbon_emitted} kg CO₂`);
      console.log(`  - Date: ${journey.date}`);
    });

    // Calculate totals and aggregations
    const totalCarbonKg = journeys.reduce((sum, j) => sum + parseFloat(j.carbon_emitted), 0);
    const totalDistanceKm = journeys.reduce((sum, j) => sum + parseFloat(j.distance_km), 0);
    const journeyCount = journeys.length;
    const averagePerJourney = journeyCount > 0 ? totalCarbonKg / journeyCount : 0;

    console.log(`[Carbon API Debug] Aggregation results:`);
    console.log(`  - Total carbon: ${totalCarbonKg} kg CO₂`);
    console.log(`  - Total distance: ${totalDistanceKm} km`);
    console.log(`  - Journey count: ${journeyCount}`);
    console.log(`  - Average per journey: ${averagePerJourney} kg CO₂`);

    // Calculate breakdown by mode
    const byMode = {};
    journeys.forEach(journey => {
      const mode = journey.mode;
      if (!byMode[mode]) {
        byMode[mode] = { count: 0, emissions: 0, distance: 0 };
      }
      byMode[mode].count++;
      byMode[mode].emissions += parseFloat(journey.carbon_emitted);
      byMode[mode].distance += parseFloat(journey.distance_km);
    });

    // Round values for display
    Object.keys(byMode).forEach(mode => {
      byMode[mode].emissions = Math.round(byMode[mode].emissions * 10000) / 10000;
      byMode[mode].distance = Math.round(byMode[mode].distance * 100) / 100;
      console.log(`  - Mode ${mode}: ${byMode[mode].count} journeys, ${byMode[mode].emissions} kg CO₂, ${byMode[mode].distance} km`);
    });

    console.log(`[Carbon API Debug] Sending response with ${journeys.length} journeys`);
    const response = {
      user_id: targetUserId,
      total_carbon_kg: Math.round(totalCarbonKg * 10000) / 10000,
      total_distance_km: Math.round(totalDistanceKm * 100) / 100,
      journey_count: journeyCount,
      average_per_journey: Math.round(averagePerJourney * 10000) / 10000,
      journeys: journeys.map(j => ({
        meetup_id: j.meetup_id,
        meetup_code: j.meetup_code,
        meetup_title: j.meetup_title,
        meetup_vibe: j.meetup_vibe,
        distance_km: parseFloat(j.distance_km),
        mode: j.mode,
        carbon_emitted: parseFloat(j.carbon_emitted),
        date: j.date
      })),
      by_mode: byMode
    };
    
    console.log(`[Carbon API Debug] Response payload:`, JSON.stringify(response, null, 2));
    res.status(200).json(response);

  } catch (error) {
    console.error('[Carbon API Debug] Error fetching user carbon data:', error);
    res.status(500).json({ error: 'Failed to fetch carbon data' });
  }
});

/**
 * GET /api/carbon/meetup/:id
 * Get carbon emissions data for all participants in a specific meetup
 * 
 * Response: {
 *   meetup_id: number,
 *   meetup_code: string,
 *   total_carbon_kg: number,
 *   participant_count: number,
 *   participants: [{ name, distance_km, mode, carbon_emitted }]
 * }
 */
router.get('/meetup/:id', authenticateToken, async (req, res) => {
  const meetupId = req.params.id;
  const userId = req.user.userId;

  try {
    const pool = req.app.locals.pool;

    // Check if user is a participant in this meetup
    const participantCheck = await pool.query(
      'SELECT id FROM legacy_meetup_participants WHERE meetup_id = $1 AND user_id = $2',
      [meetupId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ 
        error: 'You are not a participant in this meetup' 
      });
    }

    // Get meetup details
    const meetupResult = await pool.query(
      `SELECT 
        id,
        meetup_code,
        meetup_title,
        meetup_vibe,
        status,
        confirmed_venue_name
      FROM legacy_meetups
      WHERE id = $1`,
      [meetupId]
    );

    if (meetupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    const meetup = meetupResult.rows[0];

    // Get all participants with their carbon data
    const participantsResult = await pool.query(
      `SELECT 
        participant_name,
        distance_km,
        transit_mode as mode,
        carbon_emitted,
        location_name
      FROM legacy_meetup_participants
      WHERE meetup_id = $1
      ORDER BY carbon_emitted DESC`,
      [meetupId]
    );

    const participants = participantsResult.rows;

    // Calculate totals
    const totalCarbonKg = participants.reduce((sum, p) => 
      sum + (parseFloat(p.carbon_emitted) || 0), 0
    );
    const totalDistanceKm = participants.reduce((sum, p) => 
      sum + (parseFloat(p.distance_km) || 0), 0
    );

    res.status(200).json({
      meetup_id: parseInt(meetupId),
      meetup_code: meetup.meetup_code,
      meetup_title: meetup.meetup_title,
      meetup_vibe: meetup.meetup_vibe,
      venue_name: meetup.confirmed_venue_name,
      total_carbon_kg: Math.round(totalCarbonKg * 10000) / 10000,
      total_distance_km: Math.round(totalDistanceKm * 100) / 100,
      participant_count: participants.length,
      average_carbon_per_participant: participants.length > 0 
        ? Math.round((totalCarbonKg / participants.length) * 10000) / 10000 
        : 0,
      participants: participants.map(p => ({
        name: p.participant_name,
        location: p.location_name,
        distance_km: parseFloat(p.distance_km) || 0,
        mode: p.mode,
        carbon_emitted: parseFloat(p.carbon_emitted) || 0
      }))
    });

  } catch (error) {
    console.error('Error fetching meetup carbon data:', error);
    res.status(500).json({ error: 'Failed to fetch meetup carbon data' });
  }
});

/**
 * GET /api/carbon/stats
 * Get global carbon statistics and leaderboard
 * 
 * Response: {
 *   global_stats: { total_users, total_journeys, average_emissions, etc. },
 *   leaderboard: [{ user_id, name, total_carbon, rank }],
 *   mode_distribution: { mode: { count, percentage } }
 * }
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const pool = req.app.locals.pool;

    // Get global statistics using the database view
    const globalStatsResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT user_id) as total_users,
        COUNT(*) as total_journeys,
        SUM(carbon_emitted) as total_carbon_kg,
        AVG(carbon_emitted) as avg_per_journey,
        SUM(distance_km) as total_distance_km
      FROM legacy_meetup_participants
      WHERE user_id IS NOT NULL AND carbon_emitted > 0
    `);

    const globalStats = globalStatsResult.rows[0];

    // Get mode distribution
    const modeDistResult = await pool.query(`
      SELECT 
        transit_mode as mode,
        COUNT(*) as count,
        SUM(carbon_emitted) as total_emissions,
        SUM(distance_km) as total_distance
      FROM legacy_meetup_participants
      WHERE carbon_emitted > 0
      GROUP BY transit_mode
      ORDER BY count DESC
    `);

    const totalJourneys = parseInt(globalStats.total_journeys) || 1;
    const modeDistribution = {};
    
    modeDistResult.rows.forEach(row => {
      modeDistribution[row.mode] = {
        count: parseInt(row.count),
        percentage: Math.round((parseInt(row.count) / totalJourneys) * 1000) / 10,
        total_emissions: parseFloat(row.total_emissions),
        total_distance: parseFloat(row.total_distance)
      };
    });

    // Get leaderboard (top 10 users with lowest average emissions)
    const leaderboardResult = await pool.query(`
      SELECT 
        mp.user_id,
        u.name as user_name,
        SUM(mp.carbon_emitted) as total_carbon_kg,
        COUNT(*) as journey_count,
        AVG(mp.carbon_emitted) as avg_per_journey
      FROM legacy_meetup_participants mp
      JOIN users u ON mp.user_id = u.id
      WHERE mp.carbon_emitted > 0
      GROUP BY mp.user_id, u.name
      HAVING COUNT(*) >= 3
      ORDER BY AVG(mp.carbon_emitted) ASC
      LIMIT 10
    `);

    const leaderboard = leaderboardResult.rows.map((row, index) => ({
      rank: index + 1,
      user_id: row.user_id,
      user_name: row.user_name,
      total_carbon_kg: Math.round(parseFloat(row.total_carbon_kg) * 10000) / 10000,
      journey_count: parseInt(row.journey_count),
      average_per_journey: Math.round(parseFloat(row.avg_per_journey) * 10000) / 10000,
      badge: getBadgeForRank(index + 1, parseFloat(row.avg_per_journey))
    }));

    // Calculate carbon saved vs all driving
    const actualCarbon = parseFloat(globalStats.total_carbon_kg) || 0;
    const totalDistance = parseFloat(globalStats.total_distance_km) || 0;
    const ifAllDriving = totalDistance * 0.12; // 0.12 kg/km for driving
    const carbonSaved = Math.round((ifAllDriving - actualCarbon) * 10000) / 10000;

    res.status(200).json({
      global_stats: {
        total_users: parseInt(globalStats.total_users) || 0,
        total_journeys: parseInt(globalStats.total_journeys) || 0,
        total_carbon_kg: Math.round(actualCarbon * 10000) / 10000,
        total_distance_km: Math.round(totalDistance * 100) / 100,
        average_per_journey: Math.round(parseFloat(globalStats.avg_per_journey || 0) * 10000) / 10000,
        carbon_saved_vs_driving: carbonSaved > 0 ? carbonSaved : 0
      },
      mode_distribution: modeDistribution,
      leaderboard: leaderboard
    });

  } catch (error) {
    console.error('Error fetching carbon stats:', error);
    res.status(500).json({ error: 'Failed to fetch carbon statistics' });
  }
});

/**
 * Helper function to assign badge based on rank and performance
 */
function getBadgeForRank(rank, avgEmissions) {
  if (avgEmissions === 0) {
    return 'Zero Emissions Hero';
  } else if (rank === 1) {
    return 'Green Champion';
  } else if (rank === 2) {
    return 'Eco Warrior';
  } else if (rank === 3) {
    return 'Sustainability Star';
  } else if (avgEmissions < 0.5) {
    return 'Low Carbon Leader';
  } else {
    return 'Eco Conscious';
  }
}

/**
 * POST /api/carbon/calculate
 * Calculate carbon emissions for a journey without logging it
 * (Useful for previewing emissions before committing)
 * 
 * Request body: {
 *   origin: { lat: number, lng: number },
 *   destination: { lat: number, lng: number },
 *   mode_of_transport: string
 * }
 * 
 * Response: {
 *   distance_km: number,
 *   carbon_emitted: number,
 *   alternatives: [{ mode, carbon, savings }]
 * }
 */
router.post('/calculate', authenticateToken, async (req, res) => {
  const { origin, destination, mode_of_transport } = req.body;

  try {
    // Validate inputs
    if (!origin || !destination || !mode_of_transport) {
      return res.status(400).json({ 
        error: 'Missing required fields: origin, destination, mode_of_transport' 
      });
    }

    if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      return res.status(400).json({ 
        error: 'Origin and destination must include lat and lng' 
      });
    }

    // Calculate distance
    const distanceKm = calculateDistance(
      origin.lat, 
      origin.lng, 
      destination.lat, 
      destination.lng
    );

    // Calculate carbon for current mode
    const modeLower = mode_of_transport.toLowerCase();
    const carbonEmitted = calculateCarbonEmission(distanceKm, modeLower);

    // Calculate alternatives
    const allModes = ['walking', 'bicycling', 'transit', 'driving'];
    const alternatives = allModes
      .filter(m => m !== modeLower)
      .map(altMode => {
        const altCarbon = calculateCarbonEmission(distanceKm, altMode);
        const savings = carbonEmitted - altCarbon;
        const percentSavings = carbonEmitted > 0 
          ? Math.round((savings / carbonEmitted) * 100) 
          : 0;

        return {
          mode: altMode,
          carbon_emitted: Math.round(altCarbon * 10000) / 10000,
          savings: Math.round(savings * 10000) / 10000,
          percent_savings: percentSavings,
          is_better: savings > 0
        };
      })
      .sort((a, b) => a.carbon_emitted - b.carbon_emitted);

    // Get context
    const context = getCarbonContextData(carbonEmitted);

    res.status(200).json({
      distance_km: distanceKm,
      mode_of_transport: modeLower,
      carbon_emitted: Math.round(carbonEmitted * 10000) / 10000,
      context: context,
      alternatives: alternatives
    });

  } catch (error) {
    console.error('Error calculating carbon:', error);
    res.status(500).json({ error: 'Failed to calculate carbon emissions' });
  }
});

/**
 * PATCH /api/carbon/meetup/:id/update
 * Update carbon data for a meetup participant
 * (Used when meetup venue is confirmed to calculate actual distances)
 * 
 * Request body: {
 *   venue_lat: number,
 *   venue_lng: number
 * }
 */
router.patch('/meetup/:id/update', authenticateToken, async (req, res) => {
  const meetupId = req.params.id;
  const userId = req.user.userId;
  const { venue_lat, venue_lng } = req.body;

  try {
    const pool = req.app.locals.pool;

    // Validate venue coordinates
    if (!venue_lat || !venue_lng) {
      return res.status(400).json({ 
        error: 'Missing required fields: venue_lat, venue_lng' 
      });
    }

    // Get participant data
    const participantResult = await pool.query(
      `SELECT 
        id,
        location_lat,
        location_lng,
        transit_mode
      FROM legacy_meetup_participants
      WHERE meetup_id = $1 AND user_id = $2`,
      [meetupId, userId]
    );

    if (participantResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Participant record not found' 
      });
    }

    const participant = participantResult.rows[0];

    // Calculate distance from participant location to venue
    const distanceKm = calculateDistance(
      participant.location_lat,
      participant.location_lng,
      venue_lat,
      venue_lng
    );

    // Calculate carbon emissions
    const carbonEmitted = calculateCarbonEmission(
      distanceKm, 
      participant.transit_mode
    );

    // Update participant record
    await pool.query(
      `UPDATE legacy_meetup_participants 
       SET distance_km = $1, 
           carbon_emitted = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [distanceKm, carbonEmitted, participant.id]
    );

    res.status(200).json({
      success: true,
      updated: {
        distance_km: distanceKm,
        carbon_emitted: carbonEmitted,
        mode: participant.transit_mode
      }
    });

  } catch (error) {
    console.error('Error updating carbon data:', error);
    res.status(500).json({ error: 'Failed to update carbon data' });
  }
});

/**
 * POST /api/carbon/meetup/:id/batch-update
 * Batch update carbon data for all participants when venue is confirmed
 * (Called automatically when a meetup venue is confirmed)
 * 
 * Request body: {
 *   venue_lat: number,
 *   venue_lng: number
 * }
 */
router.post('/meetup/:id/batch-update', authenticateToken, async (req, res) => {
  const meetupId = req.params.id;
  const userId = req.user.userId;
  const { venue_lat, venue_lng } = req.body;

  try {
    const pool = req.app.locals.pool;

    // Check if user is organizer or participant
    const meetupCheck = await pool.query(
      `SELECT m.id, m.created_by
       FROM legacy_meetups m
       JOIN legacy_meetup_participants mp ON m.id = mp.meetup_id
       WHERE m.id = $1 AND (m.created_by = $2 OR mp.user_id = $2)`,
      [meetupId, userId]
    );

    if (meetupCheck.rows.length === 0) {
      return res.status(403).json({ 
        error: 'You are not authorized to update this meetup' 
      });
    }

    // Validate venue coordinates
    if (!venue_lat || !venue_lng) {
      return res.status(400).json({ 
        error: 'Missing required fields: venue_lat, venue_lng' 
      });
    }

    // Get all participants
    const participantsResult = await pool.query(
      `SELECT 
        id,
        participant_name,
        location_lat,
        location_lng,
        transit_mode
      FROM legacy_meetup_participants
      WHERE meetup_id = $1`,
      [meetupId]
    );

    const participants = participantsResult.rows;
    const updates = [];

    // Calculate and update carbon for each participant
    for (const participant of participants) {
      const distanceKm = calculateDistance(
        participant.location_lat,
        participant.location_lng,
        venue_lat,
        venue_lng
      );

      const carbonEmitted = calculateCarbonEmission(
        distanceKm,
        participant.transit_mode
      );

      await pool.query(
        `UPDATE legacy_meetup_participants
         SET distance_km = $1,
             carbon_emitted = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [distanceKm, carbonEmitted, participant.id]
      );

      updates.push({
        participant_name: participant.participant_name,
        distance_km: distanceKm,
        carbon_emitted: carbonEmitted,
        mode: participant.transit_mode
      });
    }

    // Calculate totals
    const totalCarbon = updates.reduce((sum, u) => sum + u.carbon_emitted, 0);
    const totalDistance = updates.reduce((sum, u) => sum + u.distance_km, 0);

    res.status(200).json({
      success: true,
      message: 'Carbon data updated for all participants',
      meetup_id: parseInt(meetupId),
      total_carbon_kg: Math.round(totalCarbon * 10000) / 10000,
      total_distance_km: Math.round(totalDistance * 100) / 100,
      participant_count: updates.length,
      updates: updates
    });

  } catch (error) {
    console.error('Error batch updating carbon data:', error);
    res.status(500).json({ error: 'Failed to batch update carbon data' });
  }
});

/**
 * GET /api/carbon/comparison
 * Get carbon comparison across different transport modes for a typical journey
 * 
 * Query params: ?distance=10 (distance in km)
 * 
 * Response: {
 *   distance_km: number,
 *   comparisons: [{ mode, carbon, relative_impact }]
 * }
 */
router.get('/comparison', authenticateToken, async (req, res) => {
  try {
    const distanceKm = parseFloat(req.query.distance) || 10;

    if (distanceKm < 0 || distanceKm > 1000) {
      return res.status(400).json({ 
        error: 'Distance must be between 0 and 1000 km' 
      });
    }

    const modes = ['walking', 'bicycling', 'transit', 'driving'];
    const comparisons = modes.map(mode => {
      const carbon = calculateCarbonEmission(distanceKm, mode);
      return {
        mode: mode,
        carbon_emitted: Math.round(carbon * 10000) / 10000,
        formatted: `${Math.round(carbon * 100) / 100} kg CO₂`
      };
    });

    // Find max for relative comparison
    const maxCarbon = Math.max(...comparisons.map(c => c.carbon_emitted));

    // Add relative impact percentage
    comparisons.forEach(c => {
      c.relative_impact = maxCarbon > 0 
        ? Math.round((c.carbon_emitted / maxCarbon) * 100) 
        : 0;
    });

    res.status(200).json({
      distance_km: distanceKm,
      comparisons: comparisons,
      recommendation: 'Walking and cycling produce zero emissions!'
    });

  } catch (error) {
    console.error('Error generating comparison:', error);
    res.status(500).json({ error: 'Failed to generate comparison' });
  }
});

module.exports = router;
