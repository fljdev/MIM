const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(
  `SELECT column_name, data_type, column_default, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'holdings'
   ORDER BY ordinal_position;`
).then(result => {
  console.log('column_name | data_type | column_default | is_nullable');
  console.log('------------------------------------------------------');
  result.rows.forEach(row => {
    console.log(
      `${row.column_name} | ${row.data_type} | ${row.column_default ?? ''} | ${row.is_nullable}`
    );
  });
  pool.end();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
