-- ROLLBACK: Extraction Quality System
-- Reverts ALL changes from 20260310_extraction_quality_tables.sql
-- and 20260310_extraction_evals.sql
--
-- Safe to run: drops new tables and columns only.
-- Does NOT touch existing data in users, reports, or other tables.
--
-- Usage:
--   /opt/homebrew/opt/libpq/bin/psql $NEON_DATABASE_URL -f db-schema/migrations/20260310_rollback_extraction_quality.sql

BEGIN;

-- Drop tables (reverse order of creation, CASCADE drops indexes too)
DROP TABLE IF EXISTS extraction_evals CASCADE;
DROP TABLE IF EXISTS extraction_reviews CASCADE;
DROP TABLE IF EXISTS unmapped_metrics CASCADE;

-- NOTE: blob_url (reports) and is_admin (users) are NOT dropped here.
-- They were added in 20260310_extraction_quality_tables.sql but are now
-- load-bearing for the application (admin auth, PDF display).

COMMIT;
