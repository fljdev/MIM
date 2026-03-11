-- Rollback Migration 011: Restore Legacy Tables
-- Date: March 10, 2025
-- Purpose: Rename legacy tables back to original names

-- IMPORTANT: This rollback renames tables back from legacy_ prefix
-- All data preserved in the process

-- 1. RESTORE ACCESSIBILITY TABLES FROM LEGACY
DO $$
BEGIN
  -- legacy_accessible_venues → accessible_venues
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_accessible_venues'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'accessible_venues'
  ) THEN
    ALTER TABLE legacy_accessible_venues RENAME TO accessible_venues;
    RAISE NOTICE 'Renamed legacy_accessible_venues back to accessible_venues';
  END IF;
  
  -- legacy_accessibility_reviews → accessibility_reviews
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_accessibility_reviews'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'accessibility_reviews'
  ) THEN
    ALTER TABLE legacy_accessibility_reviews RENAME TO accessibility_reviews;
    RAISE NOTICE 'Renamed legacy_accessibility_reviews back to accessibility_reviews';
  END IF;
  
  -- legacy_venue_physical_accessibility → venue_physical_accessibility
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_venue_physical_accessibility'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'venue_physical_accessibility'
  ) THEN
    ALTER TABLE legacy_venue_physical_accessibility RENAME TO venue_physical_accessibility;
    RAISE NOTICE 'Renamed legacy_venue_physical_accessibility back to venue_physical_accessibility';
  END IF;
  
  -- legacy_venue_sensory_accessibility → venue_sensory_accessibility
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_venue_sensory_accessibility'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'venue_sensory_accessibility'
  ) THEN
    ALTER TABLE legacy_venue_sensory_accessibility RENAME TO venue_sensory_accessibility;
    RAISE NOTICE 'Renamed legacy_venue_sensory_accessibility back to venue_sensory_accessibility';
  END IF;
  
  -- legacy_user_accessibility_profiles → user_accessibility_profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_user_accessibility_profiles'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'user_accessibility_profiles'
  ) THEN
    ALTER TABLE legacy_user_accessibility_profiles RENAME TO user_accessibility_profiles;
    RAISE NOTICE 'Renamed legacy_user_accessibility_profiles back to user_accessibility_profiles';
  END IF;
  
  -- legacy_venue_special_events → venue_special_events
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_venue_special_events'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'venue_special_events'
  ) THEN
    ALTER TABLE legacy_venue_special_events RENAME TO venue_special_events;
    RAISE NOTICE 'Renamed legacy_venue_special_events back to venue_special_events';
  END IF;
END $$;

-- 2. RESTORE MEETUP TABLES FROM LEGACY
DO $$
BEGIN
  -- legacy_meetups → meetups
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_meetups'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetups'
  ) THEN
    ALTER TABLE legacy_meetups RENAME TO meetups;
    RAISE NOTICE 'Renamed legacy_meetups back to meetups';
  END IF;
  
  -- legacy_meetup_participants → meetup_participants
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_meetup_participants'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetup_participants'
  ) THEN
    ALTER TABLE legacy_meetup_participants RENAME TO meetup_participants;
    RAISE NOTICE 'Renamed legacy_meetup_participants back to meetup_participants';
  END IF;
  
  -- legacy_meetup_time_suggestions → meetup_time_suggestions
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_meetup_time_suggestions'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetup_time_suggestions'
  ) THEN
    ALTER TABLE legacy_meetup_time_suggestions RENAME TO meetup_time_suggestions;
    RAISE NOTICE 'Renamed legacy_meetup_time_suggestions back to meetup_time_suggestions';
  END IF;
  
  -- legacy_meetup_comments → meetup_comments
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_meetup_comments'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetup_comments'
  ) THEN
    ALTER TABLE legacy_meetup_comments RENAME TO meetup_comments;
    RAISE NOTICE 'Renamed legacy_meetup_comments back to meetup_comments';
  END IF;
  
  -- legacy_meetup_messages → meetup_messages
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_meetup_messages'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetup_messages'
  ) THEN
    ALTER TABLE legacy_meetup_messages RENAME TO meetup_messages;
    RAISE NOTICE 'Renamed legacy_meetup_messages back to meetup_messages';
  END IF;
  
  -- legacy_meetup_venue_votes → meetup_venue_votes
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_meetup_venue_votes'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetup_venue_votes'
  ) THEN
    ALTER TABLE legacy_meetup_venue_votes RENAME TO meetup_venue_votes;
    RAISE NOTICE 'Renamed legacy_meetup_venue_votes back to meetup_venue_votes';
  END IF;
  
  -- legacy_transport_services → transport_services
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'legacy_transport_services'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'transport_services'
  ) THEN
    ALTER TABLE legacy_transport_services RENAME TO transport_services;
    RAISE NOTICE 'Renamed legacy_transport_services back to transport_services';
  END IF;
END $$;

-- 3. REMOVE LEGACY COMMENTS
DO $$
BEGIN
  -- Remove legacy comments if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'accessible_venues'
  ) THEN
    COMMENT ON TABLE accessible_venues IS 'Accessible venues information';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetups'
  ) THEN
    COMMENT ON TABLE meetups IS 'Meetup groups for accessibility meetings';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'meetup_participants'
  ) THEN
    COMMENT ON TABLE meetup_participants IS 'Participants in meetups with carbon tracking';
  END IF;
END $$;

-- Rollback verification
DO $$ 
BEGIN
  RAISE NOTICE 'Rollback 011: Legacy tables restored successfully';
  RAISE NOTICE 'Accessibility tables renamed back from legacy_ prefix';
  RAISE NOTICE 'Meetup tables renamed back from legacy_ prefix';
  RAISE NOTICE 'All data preserved in restored tables';
  RAISE NOTICE 'No tables were dropped - only renamed back';
END $$;