const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'REDACTED';

// Authentication middleware (same as savedLocations.js)
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

// GET /api/favorite-venues - Get all favorite venues for authenticated user
router.get('/favorite-venues', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT 
        id, user_id, venue_id, venue_name, venue_address,
        venue_lat, venue_lng, venue_type, notes, created_at
       FROM favorite_venues 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching favorite venues:', error);
    res.status(500).json({ error: 'Failed to fetch favorite venues' });
  }
});

// POST /api/favorite-venues - Add venue to favorites
router.post('/favorite-venues', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const {
    venue_id,
    venue_name,
    venue_address,
    venue_lat,
    venue_lng,
    venue_type,
    notes
  } = req.body;

  try {
    // Validate required fields
    if (!venue_id || !venue_name) {
      return res.status(400).json({ 
        error: 'venue_id and venue_name are required' 
      });
    }

    // Check for duplicate (user_id + venue_id UNIQUE constraint)
    const duplicateCheck = await pool.query(
      'SELECT id FROM favorite_venues WHERE user_id = $1 AND venue_id = $2',
      [userId, venue_id]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Venue is already in your favorites' 
      });
    }

    // Validate coordinates if provided
    let lat = null;
    let lng = null;
    
    if (venue_lat !== undefined && venue_lng !== undefined) {
      lat = parseFloat(venue_lat);
      lng = parseFloat(venue_lng);
      
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ 
          error: 'Invalid latitude or longitude values' 
        });
      }
    }

    // Insert new favorite venue
    const result = await pool.query(
      `INSERT INTO favorite_venues 
       (user_id, venue_id, venue_name, venue_address, venue_lat, venue_lng, venue_type, notes, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [
        userId,
        venue_id,
        venue_name,
        venue_address || null,
        lat,
        lng,
        venue_type || null,
        notes || null
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error adding favorite venue:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') { // unique_violation
      return res.status(409).json({ 
        error: 'Venue is already in your favorites' 
      });
    }
    
    res.status(500).json({ error: 'Failed to add favorite venue' });
  }
});

// PUT /api/favorite-venues/:id - Update notes field for a favorite venue
router.put('/favorite-venues/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const favoriteId = parseInt(req.params.id);
  const { notes } = req.body;

  try {
    // Validate ID
    if (isNaN(favoriteId)) {
      return res.status(400).json({ error: 'Invalid favorite venue ID' });
    }

    // Validate notes field
    if (notes === undefined) {
      return res.status(400).json({ error: 'notes field is required' });
    }

    // Verify the favorite belongs to authenticated user and update notes
    const result = await pool.query(
      `UPDATE favorite_venues 
       SET notes = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [notes, favoriteId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Favorite venue not found or does not belong to you' 
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating favorite venue:', error);
    res.status(500).json({ error: 'Failed to update favorite venue' });
  }
});

// DELETE /api/favorite-venues/:id - Remove venue from favorites
router.delete('/favorite-venues/:id', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const favoriteId = parseInt(req.params.id);

  try {
    // Validate ID
    if (isNaN(favoriteId)) {
      return res.status(400).json({ error: 'Invalid favorite venue ID' });
    }

    // Verify the favorite belongs to authenticated user and delete
    const result = await pool.query(
      `DELETE FROM favorite_venues 
       WHERE id = $1 AND user_id = $2
       RETURNING id, venue_name`,
      [favoriteId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Favorite venue not found or does not belong to you' 
      });
    }

    const deletedFavorite = result.rows[0];

    res.json({
      message: 'Venue removed from favorites',
      deletedId: deletedFavorite.id,
      venueName: deletedFavorite.venue_name
    });

  } catch (error) {
    console.error('Error deleting favorite venue:', error);
    res.status(500).json({ error: 'Failed to remove favorite venue' });
  }
});

// GET /api/venues/favourites - Get favorited venue IDs for current user
router.get('/venues/favourites', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT venue_id 
       FROM favorite_venues 
       WHERE user_id = $1`,
      [userId]
    );

    const venueIds = result.rows.map(row => row.venue_id);
    res.json({ venueIds });

  } catch (error) {
    console.error('Error fetching favorited venue IDs:', error);
    res.status(500).json({ error: 'Failed to fetch favorited venues' });
  }
});

// POST /api/venues/favourite/:venueId - Add accessible venue to favorites
router.post('/venues/favourite/:venueId', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const venueId = req.params.venueId; // String, as per VARCHAR schema

  try {
    // Validate venue ID
    if (!venueId || venueId.trim() === '') {
      return res.status(400).json({ error: 'Venue ID is required' });
    }

    // Check if venue exists in accessible_venues table
    const venueResult = await pool.query(
      `SELECT 
        id, venue_name, address, latitude, longitude, venue_type
       FROM legacy_accessible_venues 
       WHERE id = $1`,
      [parseInt(venueId)] // Convert to int for accessible_venues lookup
    );

    if (venueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    const venue = venueResult.rows[0];

    // Check for duplicate (user_id + venue_id UNIQUE constraint)
    const duplicateCheck = await pool.query(
      'SELECT id FROM favorite_venues WHERE user_id = $1 AND venue_id = $2',
      [userId, venueId]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Venue is already in your favorites' 
      });
    }

    // Insert new favorite venue
    const result = await pool.query(
      `INSERT INTO favorite_venues 
       (user_id, venue_id, venue_name, venue_address, venue_lat, venue_lng, venue_type, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [
        userId,
        venueId,
        venue.venue_name,
        venue.address || null,
        venue.latitude || null,
        venue.longitude || null,
        venue.venue_type || null
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error adding venue to favorites:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') { // unique_violation
      return res.status(409).json({ 
        error: 'Venue is already in your favorites' 
      });
    }
    
    res.status(500).json({ error: 'Failed to add venue to favorites' });
  }
});

// DELETE /api/venues/favourite/:venueId - Remove accessible venue from favorites
router.delete('/venues/favourite/:venueId', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const venueId = req.params.venueId;

  try {
    // Validate venue ID
    if (!venueId || venueId.trim() === '') {
      return res.status(400).json({ error: 'Venue ID is required' });
    }

    // Verify the favorite belongs to authenticated user and delete
    const result = await pool.query(
      `DELETE FROM favorite_venues 
       WHERE user_id = $1 AND venue_id = $2
       RETURNING id, venue_name`,
      [userId, venueId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Favorite venue not found or does not belong to you' 
      });
    }

    const deletedFavorite = result.rows[0];

    res.json({
      message: 'Venue removed from favorites',
      deletedId: deletedFavorite.id,
      venueName: deletedFavorite.venue_name
    });

  } catch (error) {
    console.error('Error deleting favorite venue:', error);
    res.status(500).json({ error: 'Failed to remove venue from favorites' });
  }
});

module.exports = router;