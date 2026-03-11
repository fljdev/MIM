-- Rollback Migration 009: Drop MiM Town Core Tables
-- Date: March 10, 2025
-- Purpose: Rollback the creation of MiM Town tables in reverse order

-- Drop tables in reverse order of creation (due to foreign key dependencies)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS materials;
DROP TABLE IF EXISTS waste_streams;
DROP TABLE IF EXISTS businesses;

-- Note: Indexes are automatically dropped when tables are dropped
-- No need to explicitly drop indexes

-- Rollback verification
DO $$ 
BEGIN
  RAISE NOTICE 'Rollback 009: MiM Town core tables dropped successfully';
  RAISE NOTICE 'Dropped tables: transactions, materials, waste_streams, businesses';
  RAISE NOTICE 'Note: This is a destructive operation - all data in these tables is lost';
END $$;