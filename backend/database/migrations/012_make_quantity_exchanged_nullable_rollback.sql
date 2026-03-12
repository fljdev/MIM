-- Rollback Migration 012: Restore quantity_exchanged NOT NULL constraint
-- Date: March 12, 2026
-- Purpose: Restore quantity_exchanged and unit NOT NULL constraints for transactions table

-- 1. RESTORE QUANTITY_EXCHANGED NOT NULL CONSTRAINT
DO $$
BEGIN
  -- First, update any NULL quantity_exchanged values to a placeholder (0.0001)
  -- since we can't have NOT NULL with NULL values
  UPDATE transactions 
  SET quantity_exchanged = 0.0001 
  WHERE quantity_exchanged IS NULL;
  
  IF FOUND THEN
    RAISE NOTICE 'Updated % transaction(s) with NULL quantity_exchanged to placeholder value 0.0001', SQL%ROWCOUNT;
  END IF;

  -- Drop the modified CHECK constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
      AND table_name = 'transactions' 
      AND constraint_name = 'transactions_quantity_exchanged_check'
  ) THEN
    ALTER TABLE transactions DROP CONSTRAINT transactions_quantity_exchanged_check;
    RAISE NOTICE 'Dropped transactions_quantity_exchanged_check constraint';
  END IF;

  -- Restore NOT NULL constraint
  ALTER TABLE transactions ALTER COLUMN quantity_exchanged SET NOT NULL;
  RAISE NOTICE 'Restored quantity_exchanged NOT NULL constraint';

  -- Re-add original CHECK constraint (quantity_exchanged > 0)
  ALTER TABLE transactions ADD CONSTRAINT transactions_quantity_exchanged_check 
    CHECK (quantity_exchanged > 0);
  RAISE NOTICE 'Added original CHECK constraint (quantity_exchanged > 0)';

END $$;

-- 2. RESTORE UNIT NOT NULL CONSTRAINT
DO $$
BEGIN
  -- Update any NULL unit values to 'units' (default placeholder)
  UPDATE transactions 
  SET unit = 'units' 
  WHERE unit IS NULL;
  
  IF FOUND THEN
    RAISE NOTICE 'Updated % transaction(s) with NULL unit to placeholder value ''units''', SQL%ROWCOUNT;
  END IF;

  -- Restore NOT NULL constraint
  ALTER TABLE transactions ALTER COLUMN unit SET NOT NULL;
  RAISE NOTICE 'Restored unit NOT NULL constraint';
END $$;

-- Rollback verification
DO $$ 
BEGIN
  RAISE NOTICE 'Rollback 012: Transactions table constraints restored successfully';
  RAISE NOTICE 'quantity_exchanged column now NOT NULL with CHECK constraint';
  RAISE NOTICE 'unit column now NOT NULL';
  RAISE NOTICE 'NULL values updated to placeholder values';
END $$;