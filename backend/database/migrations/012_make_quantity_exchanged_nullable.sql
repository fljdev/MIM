-- Migration 012: Make quantity_exchanged nullable for enquiries
-- Date: March 12, 2026
-- Purpose: Allow quantity_exchanged to be NULL in transactions table for enquiry phase

-- 1. ALTER TRANSACTIONS TABLE
DO $$
BEGIN
  -- Remove NOT NULL constraint and CHECK constraint from quantity_exchanged
  -- First, drop the existing CHECK constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
      AND table_name = 'transactions' 
      AND constraint_name = 'transactions_quantity_exchanged_check'
  ) THEN
    ALTER TABLE transactions DROP CONSTRAINT transactions_quantity_exchanged_check;
    RAISE NOTICE 'Dropped transactions_quantity_exchanged_check constraint';
  END IF;

  -- Modify quantity_exchanged column to allow NULL
  -- PostgreSQL doesn't allow directly changing NOT NULL without recreating constraint
  -- We'll drop and recreate the column with NULL allowed
  ALTER TABLE transactions ALTER COLUMN quantity_exchanged DROP NOT NULL;
  RAISE NOTICE 'Made quantity_exchanged nullable';

  -- Re-add a modified CHECK constraint that allows NULL or positive values
  ALTER TABLE transactions ADD CONSTRAINT transactions_quantity_exchanged_check 
    CHECK (quantity_exchanged IS NULL OR quantity_exchanged > 0);
  RAISE NOTICE 'Added new CHECK constraint allowing NULL or positive values';

END $$;

-- 2. UPDATE EXISTING ENQUIRY TRANSACTIONS
-- If there are any existing transactions with status 'enquiry' and quantity_exchanged = 0.0001 (placeholder),
-- set them to NULL
DO $$
BEGIN
  UPDATE transactions 
  SET quantity_exchanged = NULL 
  WHERE status = 'enquiry' 
    AND quantity_exchanged IS NOT NULL;
  
  IF FOUND THEN
    RAISE NOTICE 'Updated % existing enquiry transaction(s) to have NULL quantity_exchanged', SQL%ROWCOUNT;
  END IF;
END $$;

-- 3. UPDATE UNIT COLUMN TO ALLOW NULL FOR ENQUIRIES
-- Unit should also be nullable for enquiries since quantity is NULL
DO $$
BEGIN
  ALTER TABLE transactions ALTER COLUMN unit DROP NOT NULL;
  RAISE NOTICE 'Made unit nullable';
END $$;

-- Migration verification
DO $$ 
BEGIN
  RAISE NOTICE 'Migration 012: Transactions table updated successfully';
  RAISE NOTICE 'quantity_exchanged column now allows NULL values';
  RAISE NOTICE 'unit column now allows NULL values';
  RAISE NOTICE 'CHECK constraint updated to allow NULL or positive values';
  RAISE NOTICE 'Existing enquiry transactions updated to have NULL quantity_exchanged';
END $$;