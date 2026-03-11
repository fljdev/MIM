const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

console.log('Profile router loaded');

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

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Profile router is working' });
});

// GET /api/profile - Fetch authenticated user's profile data
router.get('/profile', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;

  try {
    // Get user info from users table
    const userResult = await pool.query(
      `SELECT 
        id, email, name, role, is_premium,
        default_transit_mode, avatar_url, bio, phone,
        notification_email, notification_sms,
        last_active_at, profile_updated_at, created_at
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get count of saved_locations
    const savedLocationsResult = await pool.query(
      'SELECT COUNT(*) as count FROM saved_locations WHERE user_id = $1',
      [userId]
    );

    // Get count of favorite_venues
    const favoriteVenuesResult = await pool.query(
      'SELECT COUNT(*) as count FROM favorite_venues WHERE user_id = $1',
      [userId]
    );

    // Get count of active meetups (status != 'completed' AND expires_at > NOW())
    const activeMeetupsResult = await pool.query(
      `SELECT COUNT(DISTINCT m.id) as count
       FROM legacy_meetups m
       JOIN legacy_meetup_participants mp ON m.id = mp.meetup_id
       WHERE mp.user_id = $1 
         AND m.status != 'completed' 
         AND m.expires_at > NOW()`,
      [userId]
    );

    const stats = {
      savedLocations: parseInt(savedLocationsResult.rows[0].count),
      favoriteVenues: parseInt(favoriteVenuesResult.rows[0].count),
      activeMeetups: parseInt(activeMeetupsResult.rows[0].count)
    };

    res.json({
      user: user,
      stats: stats
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const {
    name,
    bio,
    phone,
    avatar_url,
    default_transit_mode,
    notification_email,
    notification_sms
  } = req.body;

  try {
    // Validate default_transit_mode if provided
    if (default_transit_mode) {
      const validTransitModes = ['driving', 'transit', 'walking', 'bicycling'];
      if (!validTransitModes.includes(default_transit_mode)) {
        return res.status(400).json({ 
          error: 'Invalid default_transit_mode. Must be one of: driving, transit, walking, bicycling' 
        });
      }
    }

    // Build update query dynamically based on provided fields
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
      paramCount++;
    }

    if (bio !== undefined) {
      updateFields.push(`bio = $${paramCount}`);
      updateValues.push(bio);
      paramCount++;
    }

    if (phone !== undefined) {
      updateFields.push(`phone = $${paramCount}`);
      updateValues.push(phone);
      paramCount++;
    }

    if (avatar_url !== undefined) {
      updateFields.push(`avatar_url = $${paramCount}`);
      updateValues.push(avatar_url);
      paramCount++;
    }

    if (default_transit_mode !== undefined) {
      updateFields.push(`default_transit_mode = $${paramCount}`);
      updateValues.push(default_transit_mode);
      paramCount++;
    }

    if (notification_email !== undefined) {
      updateFields.push(`notification_email = $${paramCount}`);
      updateValues.push(notification_email);
      paramCount++;
    }

    if (notification_sms !== undefined) {
      updateFields.push(`notification_sms = $${paramCount}`);
      updateValues.push(notification_sms);
      paramCount++;
    }

    // Always update profile_updated_at
    updateFields.push(`profile_updated_at = CURRENT_TIMESTAMP`);

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add userId as the last parameter
    updateValues.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id, email, name, role, is_premium,
        default_transit_mode, avatar_url, bio, phone,
        notification_email, notification_sms,
        last_active_at, profile_updated_at, created_at
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = result.rows[0];

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
