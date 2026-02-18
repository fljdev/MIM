#!/usr/bin/env node

const { Pool } = require('pg');

// Use the provided Railway connection string
const connectionString = 'postgresql://postgres:rSEZJQNjXtIufxxxMxmtbhpgUcMxMccG@interchange.proxy.rlwy.net:54288/railway';

console.log('🔧 Setting up Accessible Ireland Database Tables');
console.log('=============================================\n');

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

// Table creation SQL statements in dependency order
const tableDefinitions = [
  {
    name: 'venues',
    sql: `
      CREATE TABLE IF NOT EXISTS venues (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        venue_type VARCHAR(100),
        google_places_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `,
    dependencies: []
  },
  {
    name: 'user_accessibility_profiles',
    sql: `
      CREATE TABLE IF NOT EXISTS user_accessibility_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        
        -- Mobility
        mobility_type VARCHAR(50),
        transport_access VARCHAR(50),
        
        -- Sensory
        autism BOOLEAN DEFAULT false,
        light_sensitivity BOOLEAN DEFAULT false,
        noise_sensitivity BOOLEAN DEFAULT false,
        crowd_sensitivity BOOLEAN DEFAULT false,
        
        -- Other
        hearing_impaired BOOLEAN DEFAULT false,
        vision_impaired BOOLEAN DEFAULT false,
        service_dog BOOLEAN DEFAULT false,
        cognitive_needs BOOLEAN DEFAULT false,
        
        -- Preferences
        preferred_transport_services JSONB,
        avoid_features JSONB,
        
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `,
    dependencies: ['users']
  },
  {
    name: 'venue_physical_accessibility',
    sql: `
      CREATE TABLE IF NOT EXISTS venue_physical_accessibility (
        id SERIAL PRIMARY KEY,
        venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
        
        -- Entrance
        step_free_entrance BOOLEAN,
        entrance_steps_count INTEGER,
        ramp_available BOOLEAN,
        automatic_door BOOLEAN,
        door_width_cm INTEGER,
        door_type VARCHAR(50),
        
        -- Parking & Drop-off
        disabled_parking_bays INTEGER DEFAULT 0,
        parking_distance_to_entrance_m INTEGER,
        parking_covered BOOLEAN,
        drop_off_zone BOOLEAN,
        drop_off_location TEXT,
        drop_off_curb_height_cm INTEGER,
        drop_off_covered BOOLEAN,
        
        -- Interior
        level_access_throughout BOOLEAN,
        lift_available BOOLEAN,
        lift_wheelchair_accessible BOOLEAN,
        corridor_width_cm INTEGER,
        narrow_passages BOOLEAN,
        
        -- Seating
        moveable_chairs BOOLEAN,
        wheelchair_space_available BOOLEAN,
        table_height_cm INTEGER,
        space_between_tables VARCHAR(20),
        
        -- Toilets
        accessible_toilet BOOLEAN,
        toilet_grab_rails BOOLEAN,
        toilet_space_for_wheelchair BOOLEAN,
        changing_places_toilet BOOLEAN,
        
        -- General
        accessibility_notes TEXT,
        photos JSONB,
        
        -- Metadata
        submitted_by INTEGER REFERENCES users(id),
        verified BOOLEAN DEFAULT false,
        verified_by INTEGER REFERENCES users(id),
        last_updated TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `,
    dependencies: ['venues', 'users']
  },
  {
    name: 'venue_sensory_accessibility',
    sql: `
      CREATE TABLE IF NOT EXISTS venue_sensory_accessibility (
        id SERIAL PRIMARY KEY,
        venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
        
        -- Noise
        noise_level VARCHAR(20),
        background_music BOOLEAN,
        music_volume VARCHAR(20),
        live_music BOOLEAN,
        
        -- Lighting
        lighting_type VARCHAR(50),
        flickering_lights BOOLEAN,
        adjustable_lighting BOOLEAN,
        
        -- Environment
        typical_crowd_level VARCHAR(20),
        busy_times JSONB,
        quiet_times JSONB,
        strong_smells BOOLEAN,
        smell_sources TEXT,
        
        -- Autism-friendly
        quiet_space_available BOOLEAN,
        sensory_overload_escape_route BOOLEAN,
        staff_autism_trained BOOLEAN,
        visual_supports_available BOOLEAN,
        
        sensory_notes TEXT,
        photos JSONB,
        
        submitted_by INTEGER REFERENCES users(id),
        verified BOOLEAN DEFAULT false,
        last_updated TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `,
    dependencies: ['venues', 'users']
  },
  {
    name: 'venue_special_events',
    sql: `
      CREATE TABLE IF NOT EXISTS venue_special_events (
        id SERIAL PRIMARY KEY,
        venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
        
        event_name VARCHAR(255) NOT NULL,
        event_type VARCHAR(50),
        description TEXT,
        
        recurring BOOLEAN DEFAULT false,
        recurrence_pattern VARCHAR(50),
        day_of_week INTEGER,
        start_time TIME,
        end_time TIME,
        next_occurrence TIMESTAMP,
        
        booking_required BOOLEAN DEFAULT false,
        booking_url VARCHAR(255),
        booking_phone VARCHAR(50),
        advance_booking_days INTEGER,
        
        max_capacity INTEGER,
        cost_euro DECIMAL(10, 2),
        special_notes TEXT,
        
        created_by INTEGER REFERENCES users(id),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `,
    dependencies: ['venues', 'users']
  },
  {
    name: 'transport_services',
    sql: `
      CREATE TABLE IF NOT EXISTS transport_services (
        id SERIAL PRIMARY KEY,
        
        service_name VARCHAR(255) NOT NULL,
        service_type VARCHAR(50),
        organization VARCHAR(255),
        
        coverage_areas JSONB,
        service_radius_km INTEGER,
        
        requires_membership BOOLEAN DEFAULT false,
        membership_cost_euro DECIMAL(10, 2),
        requires_advance_booking BOOLEAN DEFAULT false,
        advance_booking_days INTEGER,
        
        contact_phone VARCHAR(50),
        contact_email VARCHAR(255),
        booking_url VARCHAR(255),
        website VARCHAR(255),
        
        wheelchair_accessible BOOLEAN,
        vehicle_types JSONB,
        cost_structure TEXT,
        accepts_free_travel_pass BOOLEAN,
        
        operating_days JSONB,
        operating_hours TEXT,
        
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `,
    dependencies: []
  },
  {
    name: 'accessibility_reviews',
    sql: `
      CREATE TABLE IF NOT EXISTS accessibility_reviews (
        id SERIAL PRIMARY KEY,
        venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        
        overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
        review_text TEXT,
        visit_date DATE,
        would_recommend BOOLEAN,
        accessibility_needs_met BOOLEAN,
        
        created_at TIMESTAMP DEFAULT NOW()
      );
    `,
    dependencies: ['venues', 'users']
  }
];

async function checkTableExists(tableName) {
  try {
    const result = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)",
      [tableName]
    );
    return result.rows[0].exists;
  } catch (error) {
    console.error(`❌ Error checking if table "${tableName}" exists:`, error.message);
    return false;
  }
}

async function createTable(tableDef) {
  try {
    // Check if table already exists
    const exists = await checkTableExists(tableDef.name);
    
    if (exists) {
      console.log(`   ⏩ Table "${tableDef.name}" already exists, skipping...`);
      return { success: true, existed: true };
    }
    
    console.log(`   🛠️  Creating table "${tableDef.name}"...`);
    await pool.query(tableDef.sql);
    console.log(`   ✅ Table "${tableDef.name}" created successfully`);
    return { success: true, existed: false };
  } catch (error) {
    console.error(`   ❌ Failed to create table "${tableDef.name}":`, error.message);
    return { success: false, error: error.message };
  }
}

async function listExistingTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Existing tables in database:');
    result.rows.forEach(row => {
      console.log(`   📄 ${row.table_name}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Error listing existing tables:', error.message);
  }
}

async function setupDatabase() {
  let client;
  
  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    client = await pool.connect();
    console.log('✅ Connected to database successfully!\n');
    
    // List existing tables first
    await listExistingTables();
    
    console.log('🏗️  Setting up Accessible Ireland tables...\n');
    
    // Track results
    const results = {
      created: 0,
      existed: 0,
      failed: 0
    };
    
    // Create tables in order
    for (const tableDef of tableDefinitions) {
      console.log(`📦 Processing: ${tableDef.name}`);
      
      // Check dependencies first
      if (tableDef.dependencies.length > 0) {
        console.log(`   📍 Dependencies: ${tableDef.dependencies.join(', ')}`);
      }
      
      const result = await createTable(tableDef);
      
      if (result.success) {
        if (result.existed) {
          results.existed++;
        } else {
          results.created++;
        }
      } else {
        results.failed++;
      }
      
      console.log('');
    }
    
    // Summary
    console.log('🎉 Database Setup Summary:');
    console.log('========================');
    console.log(`✅ Tables created: ${results.created}`);
    console.log(`⏩ Tables already existed: ${results.existed}`);
    console.log(`❌ Tables failed: ${results.failed}`);
    
    if (results.failed === 0) {
      console.log('\n✨ All tables are ready for Accessible Ireland!');
      console.log('\nNext steps:');
      console.log('1. Run the backend server: npm start');
      console.log('2. Use the API endpoints to populate data');
      console.log('3. Enjoy your accessible journey planning!');
    } else {
      console.log('\n⚠️  Some tables failed to create. Check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Fatal error during database setup:', error.message);
    console.error('\nCheck your:');
    console.error('1. Connection string (is it correct?)');
    console.error('2. Database permissions (can you connect?)');
    console.error('3. Network access (is Railway accessible?)');
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the setup
setupDatabase().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});