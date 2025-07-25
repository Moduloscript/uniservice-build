-- Data migration: Copy dateTime to scheduledFor in booking table
-- This script safely migrates existing booking data

BEGIN;

-- First, add the scheduledFor column if it doesn't exist (already done via schema push)
-- Update all existing bookings to copy dateTime to scheduledFor where scheduledFor is null
UPDATE booking 
SET "scheduledFor" = "dateTime" 
WHERE "scheduledFor" IS NULL AND "dateTime" IS NOT NULL;

-- Set a default value for any remaining null scheduledFor values
-- (using createdAt as fallback for any edge cases)
UPDATE booking 
SET "scheduledFor" = "createdAt" 
WHERE "scheduledFor" IS NULL;

COMMIT;

-- Verification query to check the migration
-- SELECT 
--   id, 
--   "dateTime", 
--   "scheduledFor", 
--   "createdAt"
-- FROM booking 
-- WHERE "scheduledFor" IS NULL OR "dateTime" != "scheduledFor";
