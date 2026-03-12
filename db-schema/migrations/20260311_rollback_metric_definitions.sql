-- ROLLBACK: Metric Definitions System
-- Reverts changes from 20260311_metric_definitions.sql
--
-- BREAK-GLASS ONLY. Run only if the metric definitions migration causes
-- critical issues in production. This will revert to the legacy system.
--
-- Usage:
--   /opt/homebrew/opt/libpq/bin/psql $NEON_DATABASE_URL -f db-schema/migrations/20260311_rollback_metric_definitions.sql

BEGIN;

-- 1. Drop new tables (reverse order of creation)
DROP TABLE IF EXISTS metric_unit_aliases CASCADE;
DROP TABLE IF EXISTS metric_unit_conversions CASCADE;
DROP TABLE IF EXISTS metric_translations CASCADE;
DROP TABLE IF EXISTS metric_ref_ranges CASCADE;

-- 2. Remove added columns from existing tables
ALTER TABLE metric_aliases DROP COLUMN IF EXISTS metric_definition_id;
ALTER TABLE metrics DROP COLUMN IF EXISTS metric_definition_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS sex;
ALTER TABLE profiles DROP COLUMN IF EXISTS date_of_birth;

-- 3. Restore legacy table name (if renamed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metric_definitions_legacy') THEN
    -- Drop the new metric_definitions first
    DROP TABLE IF EXISTS metric_definitions CASCADE;
    -- Restore the legacy table
    ALTER TABLE metric_definitions_legacy RENAME TO metric_definitions;
  ELSE
    -- No legacy table — just drop the new one
    DROP TABLE IF EXISTS metric_definitions CASCADE;
  END IF;
END $$;

-- 4. Remove indexes that reference dropped tables/columns
DROP INDEX IF EXISTS idx_metric_ref_ranges_def;
DROP INDEX IF EXISTS idx_metric_translations_def;
DROP INDEX IF EXISTS idx_metric_unit_conversions_def;
DROP INDEX IF EXISTS idx_metric_aliases_def;
DROP INDEX IF EXISTS idx_metrics_def;
DROP INDEX IF EXISTS idx_metric_definitions_key;

COMMIT;
