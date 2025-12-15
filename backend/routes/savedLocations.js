const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

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

// GET /api/saved-locations - Get all saved locations for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;

  try {
    const result = await pool.query(
      `SELECT id, user_id, label, address, place_id, latitude, longitude, 
              created_at, updated_at, last_used_at, use_count
       FROM saved_locations 
       WHERE user_id = $1 
       ORDER BY last_used_at DESC NULLS LAST, created_at DESC`,
      [req.user.userId]
    );

    res.json({
      locations: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching saved locations:', error);
    res.status(500).json({ error: 'Failed to fetch saved locations' });
  }
});

// POST /api/saved-locations - Save a new location
router.post('/', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { label, address, place_id, latitude, longitude } = req.body;

  try {
    // Validate input
    if (!label || !address || !latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Label, address, latitude, and longitude are required' 
      });
    }

    // Validate label length
    if (label.length > 50) {
      return res.status(400).json({ 
        error: 'Label must be 50 characters or less' 
      });
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ 
        error: 'Invalid latitude or longitude values' 
      });
    }

    // Check if user already has 5 saved locations
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM saved_locations WHERE user_id = $1',
      [req.user.userId]
    );

    if (parseInt(countResult.rows[0].count) >= 5) {
      return res.status(400).json({ 
        error: 'Maximum of 5 saved locations reached. Please delete one before adding more.' 
      });
    }

    // Check if label already exists for this user
    const labelCheck = await pool.query(
      'SELECT id FROM saved_locations WHERE user_id = $1 AND label = $2',
      [req.user.userId, label]
    );

    if (labelCheck.rows.length > 0) {
      return res.status(409).json({ 
        error: `A location with the label "${label}" already exists` 
      });
    }

    // Insert new saved location
    const result = await pool.query(
      `INSERT INTO saved_locations 
       (user_id, label, address, place_id, latitude, longitude, created_at, updated_at, use_count) 
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0) 
       RETURNING *`,
      [req.user.userId, label, address, place_id || null, lat, lng]
    );

    res.status(201).json({
      message: 'Location saved successfully',
      location: result.rows[0]
    });

  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).json({ error: 'Failed to save location' });
  }
});

// PATCH /api/saved-locations/:id - Update a saved location's label
router.patch('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const locationId = parseInt(req.params.id);
  const { label } = req.body;

  try {
    // Validate ID
    if (isNaN(locationId)) {
      return res.status(400).json({ error: 'Invalid location ID' });
    }

    // Validate label
    if (!label || label.trim().length === 0) {
      return res.status(400).json({ error: 'Label is required' });
    }

    if (label.length > 50) {
      return res.status(400).json({ error: 'Label must be 50 characters or less' });
    }

    // Check if location exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM saved_locations WHERE id = $1 AND user_id = $2',
      [locationId, req.user.userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Location not found or does not belong to you' 
      });
    }

    // Check if new label already exists for another location
    const labelCheck = await pool.query(
      'SELECT id FROM saved_locations WHERE user_id = $1 AND label = $2 AND id != $3',
      [req.user.userId, label.trim(), locationId]
    );

    if (labelCheck.rows.length > 0) {
      return res.status(409).json({ 
        error: `A location with the label "${label}" already exists` 
      });
    }

    // Update the location
    const result = await pool.query(
      `UPDATE saved_locations 
       SET label = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [label.trim(), locationId, req.user.userId]
    );

    res.json({
      message: 'Location updated successfully',
      location: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// DELETE /api/saved-locations/:id - Delete a saved location
router.delete('/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const locationId = parseInt(req.params.id);

  try {
    // Validate ID
    if (isNaN(locationId)) {
      return res.status(400).json({ error: 'Invalid location ID' });
    }

    // Check if location exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM saved_locations WHERE id = $1 AND user_id = $2',
      [locationId, req.user.userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Location not found or does not belong to you' 
      });
    }

    // Delete the location
    await pool.query(
      'DELETE FROM saved_locations WHERE id = $1 AND user_id = $2',
      [locationId, req.user.userId]
    );

    res.json({
      message: 'Location deleted successfully',
      deletedId: locationId
    });

  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

// PATCH /api/saved-locations/:id/use - Update last_used_at and increment use_count
router.patch('/:id/use', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const locationId = parseInt(req.params.id);

  try {
    // Validate ID
    if (isNaN(locationId)) {
      return res.status(400).json({ error: 'Invalid location ID' });
    }

    // Update last_used_at and increment use_count
    const result = await pool.query(
      `UPDATE saved_locations 
       SET last_used_at = CURRENT_TIMESTAMP, 
           use_count = use_count + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [locationId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Location not found or does not belong to you' 
      });
    }

    res.json({
      message: 'Location usage updated',
      location: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating location usage:', error);
    res.status(500).json({ error: 'Failed to update location usage' });
  }
});

module.exports = router;