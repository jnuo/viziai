-- Fix NULL-unsafe UNIQUE constraint on metric_ref_ranges
--
-- The UNIQUE(metric_definition_id, sex, age_min, age_max) constraint
-- doesn't prevent duplicate "universal" rows where sex, age_min, age_max
-- are all NULL (PostgreSQL treats NULL != NULL for unique constraints).
--
-- Add a partial unique index to prevent duplicate universal fallback rows.

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS idx_metric_ref_ranges_universal
  ON metric_ref_ranges(metric_definition_id)
  WHERE sex IS NULL AND age_min IS NULL AND age_max IS NULL;

COMMIT;
