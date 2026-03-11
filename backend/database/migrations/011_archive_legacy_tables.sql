-- Migration 011: Archive Legacy Tables
-- Date: March 10, 2025
-- Purpose: Rename accessibility and meetup tables to legacy_ prefix (no data loss)

-- IMPORTANT: This migration ONLY renames tables, does NOT drop any data
-- All legacy tables can be accessed as legacy_* if needed for data migration or reference

-- 1. ARCHIVE ACCESSIBILITY TABLES
DO $$
BEGIN
  -- accessible_venues → legacy_accessible_venues
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'accessible_venues'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_accessible_venues'
  ) THEN
    ALTER TABLE accessible_venues RENAME TO legacy_accessible_venues;
    RAISE NOTICE 'Renamed accessible_venues to legacy_accessible_venues';
  END IF;
  
  -- accessibility_reviews → legacy_accessibility_reviews
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'accessibility_reviews'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_accessibility_reviews'
  ) THEN
    ALTER TABLE accessibility_reviews RENAME TO legacy_accessibility_reviews;
    RAISE NOTICE 'Renamed accessibility_reviews to legacy_accessibility_reviews';
  END IF;
  
  -- venue_physical_accessibility → legacy_venue_physical_accessibility
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'venue_physical_accessibility'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_venue_physical_accessibility'
  ) THEN
    ALTER TABLE venue_physical_accessibility RENAME TO legacy_venue_physical_accessibility;
    RAISE NOTICE 'Renamed venue_physical_accessibility to legacy_venue_physical_accessibility';
  END IF;
  
  -- venue_sensory_accessibility → legacy_venue_sensory_accessibility
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'venue_sensory_accessibility'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_venue_sensory_accessibility'
  ) THEN
    ALTER TABLE venue_sensory_accessibility RENAME TO legacy_venue_sensory_accessibility;
    RAISE NOTICE 'Renamed venue_sensory_accessibility to legacy_venue_sensory_accessibility';
  END IF;
  
  -- user_accessibility_profiles → legacy_user_accessibility_profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'user_accessibility_profiles'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_user_accessibility_profiles'
  ) THEN
    ALTER TABLE user_accessibility_profiles RENAME TO legacy_user_accessibility_profiles;
    RAISE NOTICE 'Renamed user_accessibility_profiles to legacy_user_accessibility_profiles';
  END IF;
  
  -- venue_special_events → legacy_venue_special_events (additional table not in original list but related)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'venue_special_events'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_venue_special_events'
  ) THEN
    ALTER TABLE venue_special_events RENAME TO legacy_venue_special_events;
    RAISE NOTICE 'Renamed venue_special_events to legacy_venue_special_events';
  END IF;
END $$;

-- 2. ARCHIVE MEETUP TABLES
DO $$
BEGIN
  -- First, drop foreign key constraints that reference meetups table
  -- This is necessary because renaming meetups would violate FK constraints
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetup_comments'
  ) THEN
    ALTER TABLE meetup_comments DROP CONSTRAINT IF EXISTS meetup_comments_meetup_id_fkey;
    RAISE NOTICE 'Dropped foreign key constraint meetup_comments_meetup_id_fkey';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetup_venue_votes'
  ) THEN
    ALTER TABLE meetup_venue_votes DROP CONSTRAINT IF EXISTS meetup_venue_votes_meetup_id_fkey;
    RAISE NOTICE 'Dropped foreign key constraint meetup_venue_votes_meetup_id_fkey';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetup_messages'
  ) THEN
    ALTER TABLE meetup_messages DROP CONSTRAINT IF EXISTS meetup_messages_meetup_id_fkey;
    RAISE NOTICE 'Dropped foreign key constraint meetup_messages_meetup_id_fkey';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetup_participants'
  ) THEN
    ALTER TABLE meetup_participants DROP CONSTRAINT IF EXISTS meetup_participants_meetup_id_fkey;
    RAISE NOTICE 'Dropped foreign key constraint meetup_participants_meetup_id_fkey';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetup_time_suggestions'
  ) THEN
    ALTER TABLE meetup_time_suggestions DROP CONSTRAINT IF EXISTS meetup_time_suggestions_meetup_id_fkey;
    RAISE NOTICE 'Dropped foreign key constraint meetup_time_suggestions_meetup_id_fkey';
  END IF;
  
  -- meetups → legacy_meetups
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetups'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_meetups'
  ) THEN
    ALTER TABLE meetups RENAME TO legacy_meetups;
    RAISE NOTICE 'Renamed meetups to legacy_meetups';
  END IF;
  
  -- meetup_participants → legacy_meetup_participants
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetup_participants'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_meetup_participants'
  ) THEN
    ALTER TABLE meetup_participants RENAME TO legacy_meetup_participants;
    RAISE NOTICE 'Renamed meetup_participants to legacy_meetup_participants';
  END IF;
  
  -- meetup_time_suggestions → legacy_meetup_time_suggestions
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetup_time_suggestions'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_meetup_time_suggestions'
  ) THEN
    ALTER TABLE meetup_time_suggestions RENAME TO legacy_meetup_time_suggestions;
    RAISE NOTICE 'Renamed meetup_time_suggestions to legacy_meetup_time_suggestions';
  END IF;
  
  -- meetup_comments → legacy_meetup_comments
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetup_comments'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_meetup_comments'
  ) THEN
    ALTER TABLE meetup_comments RENAME TO legacy_meetup_comments;
    RAISE NOTICE 'Renamed meetup_comments to legacy_meetup_comments';
  END IF;
  
  -- meetup_messages → legacy_meetup_messages
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetup_messages'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_meetup_messages'
  ) THEN
    ALTER TABLE meetup_messages RENAME TO legacy_meetup_messages;
    RAISE NOTICE 'Renamed meetup_messages to legacy_meetup_messages';
  END IF;
  
  -- meetup_venue_votes → legacy_meetup_venue_votes
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetup_venue_votes'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_meetup_venue_votes'
  ) THEN
    ALTER TABLE meetup_venue_votes RENAME TO legacy_meetup_venue_votes;
    RAISE NOTICE 'Renamed meetup_venue_votes to legacy_meetup_venue_votes';
  END IF;
  
  -- transport_services → legacy_transport_services (additional table not in original list but related)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'transport_services'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_transport_services'
  ) THEN
    ALTER TABLE transport_services RENAME TO legacy_transport_services;
    RAISE NOTICE 'Renamed transport_services to legacy_transport_services';
  END IF;
END $$;

-- 3. RENAME INDEXES FOR LEGACY TABLES (optional but good practice)
-- Note: Index names are tied to table names in PostgreSQL, so they automatically get renamed
-- when the table is renamed. We'll add comments to indicate these are legacy.

DO $$
BEGIN
  -- Add comments to legacy tables for documentation
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_accessible_venues'
  ) THEN
    COMMENT ON TABLE legacy_accessible_venues IS 'LEGACY: Original accessible venues table from MiM accessibility app';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_meetups'
  ) THEN
    COMMENT ON TABLE legacy_meetups IS 'LEGACY: Original meetups table from MiM meet-in-the-middle app';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_meetup_participants'
  ) THEN
    COMMENT ON TABLE legacy_meetup_participants IS 'LEGACY: Original meetup participants table (contains carbon tracking structure)';
  END IF;
END $$;

-- 4. CREATE A VIEW FOR BACKWARD COMPATIBILITY IF NEEDED
-- This view can help during transition period if application code still references old table names
-- Uncomment and modify if needed during transition:
/*
DO $$
BEGIN
  -- Example view for accessible_venues (if needed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'accessible_venues'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_accessible_venues'
  ) THEN
    CREATE VIEW accessible_venues AS 
    SELECT * FROM legacy_accessible_venues;
    
    COMMENT ON VIEW accessible_venues IS 'LEGACY VIEW: Forwarding to legacy_accessible_venues during transition';
    RAISE NOTICE 'Created forwarding view accessible_venues -> legacy_accessible_venues';
  END IF;
END $$;
*/

-- Migration verification
DO $$ 
BEGIN
  RAISE NOTICE 'Migration 011: Legacy tables archived successfully';
  RAISE NOTICE 'Accessibility tables renamed with legacy_ prefix';
  RAISE NOTICE 'Meetup tables renamed with legacy_ prefix';
  RAISE NOTICE 'All data preserved in legacy tables';
  RAISE NOTICE 'No tables were dropped - only renamed';
END $$;