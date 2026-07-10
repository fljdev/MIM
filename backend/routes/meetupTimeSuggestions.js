// backend/routes/meetupTimeSuggestions.js
// Handles alternative time suggestions from invitees

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// JWT Secret - use environment variable in production, fallback for development
const JWT_SECRET = process.env.JWT_SECRET;

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
 * POST /api/meetup-time-suggestions
 * Create a new time suggestion for a meetup
 */
router.post('/', authenticateToken, async (req, res) => {
  const { 
    meetup_id, 
    suggested_date, 
    suggested_time_start, 
    suggested_time_end,
    message 
  } = req.body;
  const suggested_by_user_id = req.user.userId;

  try {
    const pool = req.app.locals.pool;
    
    // Validate that user is part of this meetup
    const participantCheck = await pool.query(
      `SELECT mp.id FROM meetup_participants mp
       WHERE mp.meetup_id = $1 AND mp.user_id = $2`,
      [meetup_id, suggested_by_user_id]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a participant in this meetup' });
    }

    // Insert the suggestion
    const result = await pool.query(
      `INSERT INTO legacy_meetup_time_suggestions 
       (meetup_id, suggested_by_user_id, suggested_date, suggested_time_start, suggested_time_end, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [meetup_id, suggested_by_user_id, suggested_date, suggested_time_start, suggested_time_end, message]
    );

    res.status(201).json({
      message: 'Time suggestion created',
      suggestion: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating time suggestion:', error);
    res.status(500).json({ error: 'Failed to create time suggestion' });
  }
});

/**
 * GET /api/meetup-time-suggestions/:meetupId
 * Get all time suggestions for a meetup
 */
router.get('/:meetupId', authenticateToken, async (req, res) => {
  const { meetupId } = req.params;
  const userId = req.user.userId;

  try {
    const pool = req.app.locals.pool;
    
    // Verify user is part of the meetup
    const participantCheck = await pool.query(
      `SELECT mp.id FROM meetup_participants mp
       WHERE mp.meetup_id = $1 AND mp.user_id = $2`,
      [meetupId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a participant in this meetup' });
    }

    // Get all suggestions with user info
    const result = await pool.query(
      `SELECT 
        mts.*,
        u.name as suggested_by_name,
        u.email as suggested_by_email
       FROM legacy_meetup_time_suggestions mts
       JOIN users u ON u.id = mts.suggested_by_user_id
       WHERE mts.meetup_id = $1
       ORDER BY mts.created_at DESC`,
      [meetupId]
    );

    res.json({ suggestions: result.rows });
  } catch (error) {
    console.error('Error fetching time suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch time suggestions' });
  }
});

/**
 * PATCH /api/meetup-time-suggestions/:suggestionId/accept
 * Accept a time suggestion (only meetup creator can do this)
 */
router.patch('/:suggestionId/accept', authenticateToken, async (req, res) => {
  const { suggestionId } = req.params;
  const userId = req.user.userId;

  try {
    const pool = req.app.locals.pool;
    
    // Get the suggestion and verify user is the meetup creator
    const suggestionResult = await pool.query(
      `SELECT mts.*, m.created_by
       FROM legacy_meetup_time_suggestions mts
       JOIN legacy_meetups m ON m.id = mts.meetup_id
       WHERE mts.id = $1`,
      [suggestionId]
    );

    if (suggestionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    const suggestion = suggestionResult.rows[0];

    if (suggestion.created_by !== userId) {
      return res.status(403).json({ error: 'Only the meetup creator can accept suggestions' });
    }

    // Update the meetup with the new proposed time
    await pool.query(
      `UPDATE legacy_meetups
       SET proposed_date = $1,
           proposed_time_start = $2,
           proposed_time_end = $3
       WHERE id = $4`,
      [suggestion.suggested_date, suggestion.suggested_time_start, suggestion.suggested_time_end, suggestion.meetup_id]
    );

    // Mark this suggestion as accepted
    await pool.query(
      `UPDATE legacy_meetup_time_suggestions
       SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [suggestionId]
    );

    // Mark all other suggestions for this meetup as rejected
    await pool.query(
      `UPDATE legacy_meetup_time_suggestions
       SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
       WHERE meetup_id = $1 AND id != $2 AND status = 'pending'`,
      [suggestion.meetup_id, suggestionId]
    );

    res.json({ message: 'Time suggestion accepted and meetup updated' });
  } catch (error) {
    console.error('Error accepting time suggestion:', error);
    res.status(500).json({ error: 'Failed to accept time suggestion' });
  }
});

module.exports = router;