-- Migration 010: Modify Users & Favorites for MiM Town
-- Date: March 10, 2025
-- Purpose: Add business context to users table and rename favorites for materials

-- 1. ADD BUSINESS PROFILE ID TO USERS TABLE
DO $$
BEGIN
  -- Add business_profile_id column (nullable initially)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'business_profile_id'
  ) THEN
    ALTER TABLE users ADD COLUMN business_profile_id INTEGER;
    
    -- Add comment for documentation
    COMMENT ON COLUMN users.business_profile_id IS 'Foreign key to businesses table for business users';
  END IF;
END $$;

-- 2. ADD BUSINESS TO ROLE ENUM (IF NOT ALREADY PRESENT)
-- Since role is VARCHAR(50) without a CHECK constraint, we need to ensure
-- the application logic handles 'business' as a valid role value.
-- We'll add a CHECK constraint if one doesn't exist.
DO $$
BEGIN
  -- Check if there's already a CHECK constraint on role column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage ccu
    JOIN information_schema.table_constraints tc 
      ON ccu.constraint_name = tc.constraint_name
    WHERE ccu.table_schema = 'public' 
      AND ccu.table_name = 'users' 
      AND ccu.column_name = 'role'
      AND tc.constraint_type = 'CHECK'
  ) THEN
    -- Add CHECK constraint to ensure role values are valid
    ALTER TABLE users ADD CONSTRAINT check_valid_role 
    CHECK (role IN ('admin', 'app_user', 'business'));
    
    RAISE NOTICE 'Added CHECK constraint on users.role column';
  ELSE
    RAISE NOTICE 'CHECK constraint already exists on users.role column';
  END IF;
END $$;

-- 3. RENAME favorite_venues TO saved_materials
DO $$
BEGIN
  -- Check if favorite_venues table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'favorite_venues'
  ) THEN
    -- Rename the table
    ALTER TABLE favorite_venues RENAME TO saved_materials;
    RAISE NOTICE 'Renamed favorite_venues to saved_materials';
  ELSE
    RAISE NOTICE 'favorite_venues table does not exist (may have been renamed already)';
  END IF;
END $$;

-- 4. MODIFY saved_materials TABLE STRUCTURE
DO $$
BEGIN
  -- Check if saved_materials table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'saved_materials'
  ) THEN
    -- Add material_id column (nullable initially to allow migration)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'saved_materials' 
        AND column_name = 'material_id'
    ) THEN
      ALTER TABLE saved_materials ADD COLUMN material_id INTEGER;
      
      -- Add foreign key constraint (deferrable to allow migration)
      ALTER TABLE saved_materials 
      ADD CONSTRAINT saved_materials_material_id_fkey 
      FOREIGN KEY (material_id) REFERENCES materials(id) 
      ON DELETE CASCADE 
      DEFERRABLE INITIALLY DEFERRED;
      
      RAISE NOTICE 'Added material_id column and foreign key to saved_materials';
    END IF;
    
    -- Clean up old data from accessibility app (venue favorites don't map to materials)
    -- Delete existing favorite_venues data since it references old accessibility venues
    DELETE FROM saved_materials;
    RAISE NOTICE 'Cleared old favorite_venues data (6 rows from accessibility app)';
    
    -- Drop venue_id column (only after confirming it exists and we have migration path)
    -- Note: This is a breaking change - only execute if venue_id exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'saved_materials' 
        AND column_name = 'venue_id'
    ) THEN
      -- Drop the venue_id column
      ALTER TABLE saved_materials DROP COLUMN venue_id;
      RAISE NOTICE 'Dropped venue_id column from saved_materials';
    END IF;
    
    -- Update indexes to reflect new table name and structure
    -- Drop old indexes if they exist with old names
    IF EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'saved_materials' AND indexname = 'favorite_venues_pkey'
    ) THEN
      ALTER TABLE saved_materials RENAME CONSTRAINT favorite_venues_pkey TO saved_materials_pkey;
      RAISE NOTICE 'Renamed primary key constraint';
    END IF;
    
    IF EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'saved_materials' AND indexname = 'idx_favorite_venues_user'
    ) THEN
      ALTER INDEX idx_favorite_venues_user RENAME TO idx_saved_materials_user;
      RAISE NOTICE 'Renamed idx_favorite_venues_user to idx_saved_materials_user';
    END IF;
    
    IF EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'saved_materials' AND indexname = 'idx_favorite_venues_venue'
    ) THEN
      DROP INDEX idx_favorite_venues_venue;
      RAISE NOTICE 'Dropped idx_favorite_venues_venue index';
    END IF;
    
    -- Create new index on material_id if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'saved_materials' AND indexname = 'idx_saved_materials_material'
    ) THEN
      CREATE INDEX idx_saved_materials_material ON saved_materials(material_id);
      RAISE NOTICE 'Created idx_saved_materials_material index';
    END IF;
    
    -- Update the unique constraint to use material_id instead of venue_id
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public' 
        AND table_name = 'saved_materials' 
        AND constraint_name = 'favorite_venues_user_id_venue_id_key'
    ) THEN
      ALTER TABLE saved_materials 
      DROP CONSTRAINT favorite_venues_user_id_venue_id_key;
      
      -- Add new unique constraint on user_id and material_id
      ALTER TABLE saved_materials 
      ADD CONSTRAINT saved_materials_user_material_unique 
      UNIQUE (user_id, material_id);
      
      RAISE NOTICE 'Updated unique constraint from (user_id, venue_id) to (user_id, material_id)';
    END IF;
    
    -- Update foreign key constraint name if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public' 
        AND table_name = 'saved_materials' 
        AND constraint_name = 'favorite_venues_user_id_fkey'
    ) THEN
      ALTER TABLE saved_materials 
      RENAME CONSTRAINT favorite_venues_user_id_fkey TO saved_materials_user_id_fkey;
      RAISE NOTICE 'Renamed foreign key constraint';
    END IF;
  END IF;
END $$;

-- 5. UPDATE COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE saved_materials IS 'User-saved materials for quick access in MiM Town marketplace';
COMMENT ON COLUMN saved_materials.material_id IS 'Foreign key to materials table (replaces venue_id from accessibility app)';
COMMENT ON COLUMN users.business_profile_id IS 'Links user to their business profile (nullable for non-business users)';

-- Migration verification
DO $$ 
BEGIN
  RAISE NOTICE 'Migration 010: Users and favorites modified for MiM Town';
  RAISE NOTICE 'Added business_profile_id to users table';
  RAISE NOTICE 'Updated role validation to include "business"';
  RAISE NOTICE 'Renamed favorite_venues to saved_materials';
  RAISE NOTICE 'Added material_id foreign key and removed venue_id';
END $$;