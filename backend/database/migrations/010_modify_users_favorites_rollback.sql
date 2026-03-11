-- Rollback Migration 010: Revert Users & Favorites changes
-- Date: March 10, 2025
-- Purpose: Rollback the modifications to users and favorites tables

-- 1. REMOVE BUSINESS PROFILE ID FROM USERS TABLE
DO $$
BEGIN
  -- Remove business_profile_id column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'business_profile_id'
  ) THEN
    ALTER TABLE users DROP COLUMN business_profile_id;
    RAISE NOTICE 'Removed business_profile_id column from users table';
  END IF;
END $$;

-- 2. REMOVE BUSINESS FROM ROLE CHECK CONSTRAINT (if we added it)
DO $$
BEGIN
  -- Check if our specific constraint exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND constraint_name = 'check_valid_role'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT check_valid_role;
    RAISE NOTICE 'Removed check_valid_role constraint from users table';
  END IF;
END $$;

-- 3. RENAME saved_materials BACK TO favorite_venues
DO $$
BEGIN
  -- Check if saved_materials table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'saved_materials'
  ) THEN
    -- Rename the table back
    ALTER TABLE saved_materials RENAME TO favorite_venues;
    RAISE NOTICE 'Renamed saved_materials back to favorite_venues';
  END IF;
END $$;

-- 4. RESTORE favorite_venues TABLE STRUCTURE
DO $$
BEGIN
  -- Check if favorite_venues table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'favorite_venues'
  ) THEN
    -- Add venue_id column back (was VARCHAR(255) NOT NULL in original schema)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'favorite_venues' 
        AND column_name = 'venue_id'
    ) THEN
      ALTER TABLE favorite_venues ADD COLUMN venue_id VARCHAR(255) NOT NULL DEFAULT 'legacy_venue';
      RAISE NOTICE 'Added venue_id column back to favorite_venues';
    END IF;
    
    -- Drop material_id column if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'favorite_venues' 
        AND column_name = 'material_id'
    ) THEN
      -- Drop the foreign key constraint first
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public' 
          AND table_name = 'favorite_venues' 
          AND constraint_name = 'saved_materials_material_id_fkey'
      ) THEN
        ALTER TABLE favorite_venues DROP CONSTRAINT saved_materials_material_id_fkey;
      END IF;
      
      ALTER TABLE favorite_venues DROP COLUMN material_id;
      RAISE NOTICE 'Dropped material_id column from favorite_venues';
    END IF;
    
    -- Restore indexes to original names
    IF EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'favorite_venues' AND indexname = 'saved_materials_pkey'
    ) THEN
      ALTER TABLE favorite_venues RENAME CONSTRAINT saved_materials_pkey TO favorite_venues_pkey;
      RAISE NOTICE 'Renamed primary key constraint back to favorite_venues_pkey';
    END IF;
    
    IF EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'favorite_venues' AND indexname = 'idx_saved_materials_user'
    ) THEN
      ALTER INDEX idx_saved_materials_user RENAME TO idx_favorite_venues_user;
      RAISE NOTICE 'Renamed idx_saved_materials_user to idx_favorite_venues_user';
    END IF;
    
    -- Drop the material index if it exists
    IF EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'favorite_venues' AND indexname = 'idx_saved_materials_material'
    ) THEN
      DROP INDEX idx_saved_materials_material;
      RAISE NOTICE 'Dropped idx_saved_materials_material index';
    END IF;
    
    -- Restore the unique constraint
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public' 
        AND table_name = 'favorite_venues' 
        AND constraint_name = 'saved_materials_user_material_unique'
    ) THEN
      ALTER TABLE favorite_venues DROP CONSTRAINT saved_materials_user_material_unique;
      RAISE NOTICE 'Dropped saved_materials_user_material_unique constraint';
    END IF;
    
    -- Add back original unique constraint on user_id and venue_id
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public' 
        AND table_name = 'favorite_venues' 
        AND constraint_name = 'favorite_venues_user_id_venue_id_key'
    ) THEN
      ALTER TABLE favorite_venues 
      ADD CONSTRAINT favorite_venues_user_id_venue_id_key 
      UNIQUE (user_id, venue_id);
      RAISE NOTICE 'Added back favorite_venues_user_id_venue_id_key constraint';
    END IF;
    
    -- Restore foreign key constraint name
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public' 
        AND table_name = 'favorite_venues' 
        AND constraint_name = 'saved_materials_user_id_fkey'
    ) THEN
      ALTER TABLE favorite_venues 
      RENAME CONSTRAINT saved_materials_user_id_fkey TO favorite_venues_user_id_fkey;
      RAISE NOTICE 'Renamed foreign key constraint back to favorite_venues_user_id_fkey';
    END IF;
    
    -- Recreate venue index if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'favorite_venues' AND indexname = 'idx_favorite_venues_venue'
    ) THEN
      CREATE INDEX idx_favorite_venues_venue ON favorite_venues(venue_id);
      RAISE NOTICE 'Recreated idx_favorite_venues_venue index';
    END IF;
  END IF;
END $$;

-- 5. RESTORE COMMENTS
COMMENT ON TABLE favorite_venues IS 'User favorite venues from accessibility app';
COMMENT ON COLUMN favorite_venues.venue_id IS 'Google Places ID or venue identifier';

-- Rollback verification
DO $$ 
BEGIN
  RAISE NOTICE 'Rollback 010: Users and favorites reverted successfully';
  RAISE NOTICE 'Removed business_profile_id from users';
  RAISE NOTICE 'Removed role check constraint (if added)';
  RAISE NOTICE 'Renamed saved_materials back to favorite_venues';
  RAISE NOTICE 'Restored venue_id column and removed material_id';
  RAISE NOTICE 'Note: Any data in saved_materials was cleared during migration and cannot be recovered';
END $$;