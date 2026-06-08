require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// CORS — allow frontend dev server
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:REDACTED@interchange.proxy.rlwy.net:54288/railway',
  ssl: { rejectUnauthorized: false }
});

app.locals.pool = pool;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Move into Money API', timestamp: new Date().toISOString() });
});

// Mount routes — each receives the pool for DB access
app.use('/api/auth', require('./routes/auth')(pool));
app.use('/api/holdings', require('./routes/holdings')(pool));
app.use('/api/crypto', require('./routes/crypto')(pool));
app.use('/api/cash', require('./routes/cash')(pool));
app.use('/api/prices', require('./routes/prices')(pool));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    const dbTest = await pool.query('SELECT NOW() as time');
    console.log('Database connected:', dbTest.rows[0].time);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Move into Money API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
