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

app.use(cors());
app.use(express.json());
app.use('/api/waitlist', waitlistRoutes);

// JWT Secret - use environment variable in production, fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'mimapp-dev-secret-2025';

// Database connection - use DATABASE_URL from Railway environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://john:Sixties1-Stegosaur1-Scraggly8-Monorail8@localhost:5432/mim',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Make pool available to routes
app.locals.pool = pool;

// Root health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'Meet in Middle API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Saved locations routes
app.use('/api/saved-locations', savedLocationsRouter);

// Midpoint routes
app.use('/api/midpoint', midpointRouter);

// Meetup organized routes
app.use('/api/meetup', meetupOrganizedRouter);

// New Phase 1 meetups routes (2-person flow with shareable links)
app.use('/api/meetups', meetupsRouter);

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
  const { email, name, password } = req.body;

  try {
    // Validate input
    if (!email || !name || !password) {
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
    res.status(500).json({ error: 'Registration failed. Please try again.' });
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

// Use PORT from environment variable (Railway provides this) or fallback to 5000 for local dev
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
