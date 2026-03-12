-- POST-DEPLOY VERIFICATION: Run after 20260311_metric_definitions.sql
-- This is NOT a migration — it's a verification query to run manually.
--
-- Usage:
--   /opt/homebrew/opt/libpq/bin/psql $NEON_DATABASE_URL -f db-schema/migrations/20260311_verify_backfill.sql

-- 1. Check all definitions were seeded
SELECT COUNT(*) AS definition_count FROM metric_definitions;

-- 2. Check translations match definitions 1:1
SELECT COUNT(*) AS tr_translation_count FROM metric_translations WHERE locale = 'tr';

-- 3. Check ref ranges seeded
SELECT COUNT(*) AS ref_range_count FROM metric_ref_ranges;

-- 4. Find orphaned aliases (not linked to any definition)
SELECT alias, canonical_name
FROM metric_aliases
WHERE metric_definition_id IS NULL
ORDER BY canonical_name;

-- 5. Verify legacy table was renamed (not dropped)
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_name = 'metric_definitions_legacy'
) AS legacy_table_exists;

-- 6. Verify new columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name IN ('sex', 'date_of_birth')
ORDER BY column_name;

SELECT column_name FROM information_schema.columns
WHERE table_name = 'metrics' AND column_name IN ('metric_definition_id', 'sort_order')
ORDER BY column_name;
