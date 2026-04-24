const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:rSEZJQNjXtIufxxxMxmtbhpgUcMxMccG@interchange.proxy.rlwy.net:54288/railway',
  ssl: { rejectUnauthorized: false }
});
async function run() {
  try {
    console.log('Running migration...');
    await pool.query("ALTER TABLE holdings ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}'");
    console.log('Migration successful');
    const r = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='holdings' AND column_name='images'");
    if (r.rows.length > 0) console.log('Column:', r.rows[0].column_name, 'Type:', r.rows[0].data_type);
  } catch(e) { console.error('Failed:', e.message); }
  finally { await pool.end(); }
}
run();
