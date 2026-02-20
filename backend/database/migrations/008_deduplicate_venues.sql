-- Migration 008: Deduplicate accessible_venues and add unique constraint
-- This migration removes duplicate venues (keeping the one with lowest ID)
-- and adds a unique constraint to prevent future duplicates

-- Verify current state before cleanup
DO $$
DECLARE
    total_before INTEGER;
    duplicate_count INTEGER;
BEGIN
    -- Count total venues before cleanup
    SELECT COUNT(*) INTO total_before FROM accessible_venues;
    RAISE NOTICE 'Total venues before cleanup: %', total_before;
    
    -- Count duplicate venues (venues with same name and address)
    SELECT COUNT(*) - COUNT(DISTINCT CONCAT(venue_name, '|', COALESCE(address, '')))
    INTO duplicate_count
    FROM accessible_venues;
    
    RAISE NOTICE 'Estimated duplicate count: %', duplicate_count;
END $$;

-- Step 1: Remove duplicate venues, keeping the one with lowest ID
-- This deletes rows where there's another row with same venue_name and address but lower ID
DELETE FROM accessible_venues a
USING accessible_venues b
WHERE a.id > b.id 
  AND a.venue_name = b.venue_name 
  AND COALESCE(a.address, '') = COALESCE(b.address, '');

-- Step 2: Add unique constraint to prevent future duplicates
-- First check if constraint already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_venue_name_address' 
        AND conrelid = 'accessible_venues'::regclass
    ) THEN
        ALTER TABLE accessible_venues 
        ADD CONSTRAINT unique_venue_name_address 
        UNIQUE (venue_name, address);
        RAISE NOTICE 'Unique constraint added: unique_venue_name_address';
    ELSE
        RAISE NOTICE 'Unique constraint unique_venue_name_address already exists';
    END IF;
END $$;

-- Step 3: Verify cleanup results
DO $$
DECLARE
    total_after INTEGER;
    unique_count INTEGER;
    constraint_exists BOOLEAN;
BEGIN
    -- Count total venues after cleanup
    SELECT COUNT(*) INTO total_after FROM accessible_venues;
    RAISE NOTICE 'Total venues after cleanup: %', total_after;
    
    -- Count unique venue/address combinations
    SELECT COUNT(DISTINCT CONCAT(venue_name, '|', COALESCE(address, '')))
    INTO unique_count
    FROM accessible_venues;
    
    RAISE NOTICE 'Unique venue/address combinations: %', unique_count;
    
    -- Check if constraint exists
    SELECT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_venue_name_address' 
        AND conrelid = 'accessible_venues'::regclass
    ) INTO constraint_exists;
    
    RAISE NOTICE 'Unique constraint exists: %', constraint_exists;
    
    -- Verification message
    IF total_after = unique_count AND constraint_exists THEN
        RAISE NOTICE '✅ Cleanup successful! All venues are unique and constraint is in place.';
    ELSIF total_after > unique_count THEN
        RAISE WARNING '⚠️ Some duplicates may still exist: % total vs % unique', total_after, unique_count;
    ELSE
        RAISE NOTICE '⚠️ Verification check completed with mixed results.';
    END IF;
END $$;

-- Migration verification
DO $$ 
BEGIN
    RAISE NOTICE 'Deduplication migration completed successfully';
    RAISE NOTICE 'Removed duplicate venues, keeping the one with lowest ID';
    RAISE NOTICE 'Added unique constraint on (venue_name, address)';
    RAISE NOTICE 'Prevents future duplicate imports';
END $$;