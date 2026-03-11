const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

console.log('Accessibility Profile router loaded');

const JWT_SECRET = process.env.JWT_SECRET || 'REDACTED';

// Helper function to ensure array fields are properly serialized
const ensureArray = (value) => {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

// Authentication middleware
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
  res.json({ message: 'Accessibility Profile router is working' });
});

// POST /api/accessibility-profile - Create or update user accessibility profile
router.post('/accessibility-profile', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;
  const {
    mobilityType,
    transportAccess,
    autism,
    lightSensitivity,
    noiseSensitivity,
    crowdSensitivity,
    hearingImpaired,
    visionImpaired,
    serviceDog,
    cognitiveNeeds,
    preferredTransportServices,
    avoidFeatures
  } = req.body;

  try {
    // Check if profile already exists
    const existingProfile = await pool.query(
      'SELECT id FROM legacy_user_accessibility_profiles WHERE user_id = $1',
      [userId]
    );

    let result;
    if (existingProfile.rows.length > 0) {
      // Update existing profile
        result = await pool.query(
          `UPDATE legacy_user_accessibility_profiles 
           SET 
             mobility_type = $1,
             transport_access = $2,
             autism = $3,
             light_sensitivity = $4,
             noise_sensitivity = $5,
             crowd_sensitivity = $6,
             hearing_impaired = $7,
             vision_impaired = $8,
             service_dog = $9,
             cognitive_needs = $10,
             preferred_transport_services = $11,
             avoid_features = $12,
             updated_at = NOW()
           WHERE user_id = $13
           RETURNING *`,
          [
            mobilityType,
            transportAccess,
            autism || false,
            lightSensitivity || false,
            noiseSensitivity || false,
            crowdSensitivity || false,
            hearingImpaired || false,
            visionImpaired || false,
            serviceDog || false,
            cognitiveNeeds || false,
            JSON.stringify(ensureArray(preferredTransportServices)),
            JSON.stringify(ensureArray(avoidFeatures)),
            userId
          ]
        );
    } else {
      // Create new profile
      result = await pool.query(
        `INSERT INTO legacy_user_accessibility_profiles (
          user_id, mobility_type, transport_access, autism, light_sensitivity,
          noise_sensitivity, crowd_sensitivity, hearing_impaired, vision_impaired,
          service_dog, cognitive_needs, preferred_transport_services, avoid_features
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          userId,
          mobilityType,
          transportAccess,
          autism || false,
          lightSensitivity || false,
          noiseSensitivity || false,
          crowdSensitivity || false,
          hearingImpaired || false,
          visionImpaired || false,
          serviceDog || false,
          cognitiveNeeds || false,
          JSON.stringify(ensureArray(preferredTransportServices)),
          JSON.stringify(ensureArray(avoidFeatures))
        ]
      );
    }

    const profile = result.rows[0];

    res.json({
      message: existingProfile.rows.length > 0 ? 'Profile updated successfully' : 'Profile created successfully',
      profile: profile
    });

  } catch (error) {
    console.error('Error saving accessibility profile:', error);
    res.status(500).json({ error: 'Failed to save accessibility profile', details: error.message });
  }
});

// GET /api/accessibility-profile/me - Get current user's accessibility profile
router.get('/accessibility-profile/me', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'SELECT * FROM legacy_user_accessibility_profiles WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Accessibility profile not found' });
    }

    res.json({
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching accessibility profile:', error);
    res.status(500).json({ error: 'Failed to fetch accessibility profile' });
  }
});

// GET /api/accessibility-profile/:userId - Get user accessibility profile
router.get('/accessibility-profile/:userId', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { userId } = req.params;

  // Check if the requesting user is the same as the requested profile or admin
  if (req.user.userId !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized to access this profile' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM legacy_user_accessibility_profiles WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Accessibility profile not found' });
    }

    res.json({
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching accessibility profile:', error);
    res.status(500).json({ error: 'Failed to fetch accessibility profile' });
  }
});

// PUT /api/accessibility-profile/:userId - Update user accessibility profile
router.put('/accessibility-profile/:userId', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { userId } = req.params;
  const updates = req.body;

  // Check if the requesting user is the same as the requested profile or admin
  if (req.user.userId !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized to update this profile' });
  }

  try {
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    // List of allowed fields to update
    const allowedFields = [
      'mobility_type', 'transport_access', 'autism', 'light_sensitivity',
      'noise_sensitivity', 'crowd_sensitivity', 'hearing_impaired',
      'vision_impaired', 'service_dog', 'cognitive_needs',
      'preferred_transport_services', 'avoid_features'
    ];

    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbKey)) {
        // Handle array fields specially to ensure proper JSON array serialization
        let processedValue = value;
        if (dbKey === 'preferred_transport_services' || dbKey === 'avoid_features') {
          processedValue = JSON.stringify(ensureArray(value));
        }
        updateFields.push(`${dbKey} = $${paramCount}`);
        updateValues.push(processedValue);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Add updated_at
    updateFields.push(`updated_at = NOW()`);

    // Add userId as the last parameter
    updateValues.push(userId);
    paramCount++;

    const updateQuery = `
      UPDATE legacy_user_accessibility_profiles 
      SET ${updateFields.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Accessibility profile not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating accessibility profile:', error);
    res.status(500).json({ error: 'Failed to update accessibility profile', details: error.message });
  }
});

// DELETE /api/accessibility-profile/:userId - Delete user accessibility profile
router.delete('/accessibility-profile/:userId', authenticateToken, async (req, res) => {
  const pool = req.app.locals.pool;
  const { userId } = req.params;

  // Check if the requesting user is the same as the requested profile or admin
  if (req.user.userId !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized to delete this profile' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM legacy_user_accessibility_profiles WHERE user_id = $1 RETURNING *',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Accessibility profile not found' });
    }

    res.json({
      message: 'Profile deleted successfully',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Error deleting accessibility profile:', error);
    res.status(500).json({ error: 'Failed to delete accessibility profile' });
  }
});

module.exports = router;