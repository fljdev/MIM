require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const savedLocationsRouter = require('./routes/savedLocations');
const midpointRouter = require('./routes/midpoint');
const meetupOrganizedRouter = require('./routes/meetupOrganized');
const meetupsRouter = require('./routes/meetups');
const app = express();
const waitlistRoutes = require('./routes/waitlist');
const meetupTimeSuggestionsRouter = require('./routes/meetupTimeSuggestions');
const profileRoutes = require('./routes/profile');
const favoriteVenuesRoutes = require('./routes/favoriteVenues');
const carbonRoutes = require('./routes/carbonRoutes');
const accessibilityProfileRoutes = require('./routes/accessibilityProfile');
const venuesRoutes = require('./routes/venues');

app.use(cors());
app.use(express.json());

console.log('Registering test-early route');
// Test route at the very beginning
app.get('/api/test-early', (req, res) => {
  console.log('Test early route hit');
  res.json({ message: 'Early test route is working' });
});

app.use('/api/waitlist', waitlistRoutes);
app.use('/api/meetup-time-suggestions', meetupTimeSuggestionsRouter);

// JWT Secret - use environment variable in production, fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'REDACTED';

// Database connection - use DATABASE_URL from Railway environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://john:REDACTED@localhost:5432/mim',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Make pool available to routes
app.locals.pool = pool;

// Root health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'Accessible Ireland API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Debug endpoint to test JSON body parsing
app.post('/api/debug', (req, res) => {
  res.json({
    received: {
      body: req.body,
      bodyType: typeof req.body,
      contentType: req.headers['content-type'],
      bodyKeys: Object.keys(req.body || {})
    }
  });
});

// Saved locations routes
app.use('/api/saved-locations', savedLocationsRouter);

// Midpoint routes
app.use('/api/midpoint', midpointRouter);

// Meetup organized routes
app.use('/api/meetup', meetupOrganizedRouter);

// New Phase 1 meetups routes (2-person flow with shareable links)
app.use('/api/meetups', meetupsRouter);

// Test route
app.get('/api/test-direct', (req, res) => {
  res.json({ message: 'Direct test route is working' });
});

// Profile routes
app.use('/api', profileRoutes);

// Favorite venues routes
app.use('/api', favoriteVenuesRoutes);

// Carbon tracking routes
app.use('/api/carbon', carbonRoutes);

// Accessibility Profile routes
app.use('/api', accessibilityProfileRoutes);

// Venues routes (with accessibility)
app.use('/api', venuesRoutes);

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role, is_premium FROM users');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user (old endpoint - keeping for backwards compatibility)
app.post('/api/users', async (req, res) => {
  const { email, name, role } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING *',
      [email, name, role || 'app_user']
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register new user
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 Register request received');
  console.log('📝 Content-Type:', req.headers['content-type']);
  console.log('📝 Body:', JSON.stringify(req.body));
  console.log('📝 Body type:', typeof req.body);
  const { email, name, password } = req.body;

  try {
    // Validate input
    if (!email || !name || !password) {
      console.log('❌ Missing fields:', { email: !!email, name: !!name, password: !!password });
      return res.status(400).json({ error: 'Email, name, and password are required' });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (email, name, password_hash, role, is_premium) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, is_premium, created_at',
      [email, name, password_hash, 'app_user', false]
    );

    const newUser = result.rows[0];

    // Generate JWT token for auto-login after registration
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    res.status(201).json({
      message: 'User registered successfully',
      token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        is_premium: newUser.is_premium
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.', details: error.message });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const result = await pool.query(
      'SELECT id, email, name, password_hash, role, is_premium FROM users WHERE email = $1',
      [email]
    );

    // Check if user exists
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check if user has a password
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Account not set up. Please register.' });
    }

    // Compare password with hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Return success with token and user data
    res.json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_premium: user.is_premium
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Token verification endpoint
app.get('/api/auth/verify', async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token (automatically checks expiration)
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database
    const result = await pool.query(
      'SELECT id, email, name, role, is_premium FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_premium: user.is_premium
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Server error during token verification' });
  }
});

// Token refresh endpoint
console.log('[Server] Registering token refresh endpoint: POST /api/auth/refresh');
app.post('/api/auth/refresh', async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    console.log('[Token Refresh] Attempting to refresh token');

    // Try to verify the token, but ignore expiration for refresh
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // If token is expired, we still allow refresh within grace period (24 hours)
      if (error.name === 'TokenExpiredError') {
        const decodedExpired = jwt.decode(token);
        if (!decodedExpired || !decodedExpired.exp) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Check if token expired within last 24 hours (grace period)
        const expirationTime = decodedExpired.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const gracePeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        if (currentTime - expirationTime > gracePeriod) {
          console.log('[Token Refresh] Token expired beyond grace period');
          return res.status(401).json({ error: 'Token expired, please login again' });
        }
        
        decoded = decodedExpired;
        console.log('[Token Refresh] Token expired but within grace period, allowing refresh');
      } else {
        console.log('[Token Refresh] Invalid token:', error.name);
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    // Verify user still exists
    const result = await pool.query(
      'SELECT id, email, name, role, is_premium FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Generate new token with same payload but fresh expiration
    const newToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('[Token Refresh] Token refreshed successfully for user:', user.email);

    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_premium: user.is_premium
      }
    });

  } catch (error) {
    console.error('[Token Refresh] Error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Global error handler - catches all unhandled errors
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Use PORT from environment variable (Railway provides this) or fallback to 5000 for local dev
const PORT = process.env.PORT || 5000;

// Test database connection and start server
async function startServer() {
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    const dbTest = await pool.query('SELECT NOW() as time');
    console.log('✅ Database connected:', dbTest.rows[0].time);
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 ===================================`);
      console.log(`🚀 MiM Server running on port ${PORT}`);
      console.log(`🚀 Health: http://localhost:${PORT}/health`);
      console.log(`🚀 API: http://localhost:${PORT}/api`);
      console.log('Using DATABASE_URL:', process.env.DATABASE_URL);
      console.log(`🚀 ===================================\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
