-- Drop the UNIQUE(profile_id, sample_date) constraint on reports.
-- A person can have blood tests + urine tests on the same day as separate reports.
-- Each report is identified by its content hash, not by date.

ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_profile_id_sample_date_key;

-- Add a non-unique index for efficient date lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_profile_date
  ON reports(profile_id, sample_date);
