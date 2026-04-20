-- Migration 016: Add listing_id to transactions table
-- Date: April 19, 2026
-- Purpose: Add foreign key reference to listings table for marketplace transactions

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS listing_id INTEGER REFERENCES listings(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_transactions_listing_id ON transactions(listing_id);

-- Migration verification
DO cd /mnt/d/MIM && ls -la backend/database/migrations/014* backend/database/migrations/015* backend/database/migrations/016* 2>/dev/null || echo 'Files not found' 
BEGIN
  RAISE NOTICE 'Migration 016: Added listing_id column to transactions table';
  RAISE NOTICE 'Column links marketplace listings to transaction records';
END cd /mnt/d/MIM && ls -la backend/database/migrations/014* backend/database/migrations/015* backend/database/migrations/016* 2>/dev/null || echo 'Files not found';
