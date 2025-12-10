-- ============================================
-- DATABASE OVERVIEW
-- ============================================

-- Show current database
SELECT current_database();

-- List all tables in the database
\dt

-- List all tables with size information
\dt+


-- ============================================
-- TABLE STRUCTURES
-- ============================================

-- Describe users table
\d users

-- Describe saved_locations table
\d saved_locations

-- Show detailed info for saved_locations (includes constraints, indexes, etc)
\d+ saved_locations


-- ============================================
-- TABLE RELATIONSHIPS
-- ============================================

-- Show all foreign key relationships for saved_locations
SELECT
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'saved_locations' AND tc.constraint_type = 'FOREIGN KEY';


-- ============================================
-- INDEXES
-- ============================================

-- Show all indexes on saved_locations
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'saved_locations';


-- ============================================
-- TABLE DETAILS (for Cline context)
-- ============================================

-- Get column details for saved_locations
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'saved_locations'
ORDER BY ordinal_position;

-- Get all constraints on saved_locations
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'saved_locations';


-- ============================================
-- DATA VERIFICATION
-- ============================================

-- Verify table was created successfully
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'saved_locations'
) AS table_exists;

-- Count existing saved locations
SELECT COUNT(*) FROM saved_locations;
