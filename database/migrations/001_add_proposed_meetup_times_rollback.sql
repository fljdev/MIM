-- Rollback: Remove proposed meetup times feature
-- Date: December 9, 2024
-- Purpose: Rollback the proposed meetup times migration if needed

-- Drop the suggestions table first (due to foreign key)
DROP TABLE IF EXISTS meetup_time_suggestions;

-- Remove columns from meetups table
ALTER TABLE meetups 
DROP COLUMN IF EXISTS proposed_date,
DROP COLUMN IF EXISTS proposed_time_start,
DROP COLUMN IF EXISTS proposed_time_end,
DROP COLUMN IF EXISTS is_time_flexible;
