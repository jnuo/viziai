-- ============================================================================
-- METRIC DEFINITIONS: Global system migration
-- ============================================================================
-- Replaces the old per-profile metric_definitions table with a global system:
--   metric_definitions        — canonical metric catalog (key, unit)
--   metric_ref_ranges         — sex/age-aware reference ranges
--   metric_translations       — locale-aware display names
--   metric_unit_conversions   — convert non-canonical units
--
-- Also adds sex/date_of_birth to profiles, and metric_definition_id FK to
-- metric_aliases and metrics tables.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. RETIRE OLD metric_definitions TABLE (if it exists — Supabase-era table)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metric_definitions' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view accessible metric definitions" ON metric_definitions';
    EXECUTE 'DROP POLICY IF EXISTS "Editors can manage metric definitions" ON metric_definitions';
    EXECUTE 'DROP POLICY IF EXISTS "Service role has full access to metric_definitions" ON metric_definitions';
    DROP TRIGGER IF EXISTS update_metric_definitions_updated_at ON metric_definitions;
    ALTER TABLE metric_definitions RENAME TO metric_definitions_legacy;
    ALTER INDEX IF EXISTS idx_metric_definitions_profile RENAME TO idx_metric_definitions_legacy_profile;
    ALTER INDEX IF EXISTS idx_metric_definitions_profile_order RENAME TO idx_metric_definitions_legacy_profile_order;
  END IF;
END $$;

-- ============================================================================
-- 2. CREATE NEW TABLES
-- ============================================================================

-- Global source of truth for all metrics
CREATE TABLE metric_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,              -- slug: "hemoglobin", "crp", "alt"
  category TEXT,                         -- NULL initially, populated later
  canonical_unit TEXT,                   -- "g/dL", "mg/dL", etc. NULL if unknown
  value_type TEXT NOT NULL DEFAULT 'quantitative',  -- 'quantitative' or 'qualitative'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flexible sex + age reference ranges
CREATE TABLE metric_ref_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_definition_id UUID NOT NULL REFERENCES metric_definitions(id) ON DELETE CASCADE,
  sex TEXT,                              -- NULL = any, 'M', 'F'
  age_min INT,                           -- NULL = no lower bound
  age_max INT,                           -- NULL = no upper bound
  ref_low NUMERIC,
  ref_high NUMERIC,
  UNIQUE(metric_definition_id, sex, age_min, age_max)
);

-- Locale-aware display names (Turkish only for now)
CREATE TABLE metric_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_definition_id UUID NOT NULL REFERENCES metric_definitions(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  display_name TEXT NOT NULL,
  UNIQUE(metric_definition_id, locale)
);

-- Unit conversion factors (from_unit → canonical_unit)
CREATE TABLE metric_unit_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_definition_id UUID NOT NULL REFERENCES metric_definitions(id) ON DELETE CASCADE,
  from_unit TEXT NOT NULL,
  factor NUMERIC NOT NULL,               -- value_canonical = value_from * factor
  UNIQUE(metric_definition_id, from_unit)
);

-- ============================================================================
-- 3. ALTER EXISTING TABLES
-- ============================================================================

-- Add sex and date_of_birth to profiles
ALTER TABLE profiles ADD COLUMN sex TEXT CHECK (sex IN ('M', 'F'));
ALTER TABLE profiles ADD COLUMN date_of_birth DATE;

-- Add metric_definition_id FK to metric_aliases (nullable, backfilled below)
ALTER TABLE metric_aliases ADD COLUMN metric_definition_id UUID REFERENCES metric_definitions(id);

-- Add metric_definition_id FK to metrics (nullable, backfilled later by app)
ALTER TABLE metrics ADD COLUMN metric_definition_id UUID REFERENCES metric_definitions(id);

-- ============================================================================
-- 4. SEED METRIC DEFINITIONS
-- ============================================================================
-- Insert definitions, ref ranges (universal), translations (tr), and conversions
-- for ~70 metrics covering CBC, chemistry, liver, lipid, inflammation, thyroid,
-- iron, vitamins, coagulation, and other panels.

-- Helper: insert definition + universal ref range + Turkish translation in one go
-- We use a CTE pattern per metric for clarity and to capture the generated ID.

-- ---------------------------------------------------------------------------
-- CBC
-- ---------------------------------------------------------------------------

-- hemoglobin
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('hemoglobin', 'CBC', 'g/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 12.0, 17.5 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Hemoglobin' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'g/L', 0.1 FROM def;

-- hematokrit
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('hematokrit', 'CBC', '%') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 36, 52 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Hematokrit' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'L/L', 100 FROM def;

-- lokosit
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('lokosit', 'CBC', '10^3/uL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 4.0, 11.0 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Lökosit' FROM def
)
, conv1 AS (
  INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
  SELECT id, '10^9/L', 1 FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'G/L', 1 FROM def;

-- eritrosit
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('eritrosit', 'CBC', '10^6/uL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 4.0, 6.0 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Eritrosit' FROM def
)
, conv1 AS (
  INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
  SELECT id, '10^12/L', 1 FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'T/L', 1 FROM def;

-- trombosit
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('trombosit', 'CBC', '10^3/uL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 150, 400 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Trombosit' FROM def
)
, conv1 AS (
  INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
  SELECT id, '10^9/L', 1 FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'G/L', 1 FROM def;

-- mch
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('mch', 'CBC', 'pg') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 27, 33 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'MCH' FROM def;

-- mcv
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('mcv', 'CBC', 'fL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 80, 100 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'MCV' FROM def;

-- mchc
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('mchc', 'CBC', 'g/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 32, 36 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'MCHC' FROM def;

-- rdw
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('rdw', 'CBC', '%') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 11.5, 14.5 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'RDW' FROM def;

-- mpv
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('mpv', 'CBC', 'fL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 7.0, 11.0 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'MPV (Ortalama Trombosit Hacmi)' FROM def;

-- pdw
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('pdw', 'CBC', '%') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 10, 18 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'PDW' FROM def;

-- pct
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('pct', 'CBC', '%') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0.1, 0.5 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'PCT (Plateletkrit)' FROM def;

-- notrofil_abs
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('notrofil_abs', 'CBC', '10^3/uL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 2.0, 7.0 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Nötrofil#' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, '10^9/L', 1 FROM def;

-- notrofil_pct
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('notrofil_pct', 'CBC', '%') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 40, 70 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'Nötrofil%' FROM def;

-- lenfosit_abs
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('lenfosit_abs', 'CBC', '10^3/uL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 1.0, 3.5 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Lenfosit#' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, '10^9/L', 1 FROM def;

-- lenfosit_pct
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('lenfosit_pct', 'CBC', '%') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 20, 40 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'Lenfosit%' FROM def;

-- monosit_abs
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('monosit_abs', 'CBC', '10^3/uL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0.2, 0.8 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Monosit#' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, '10^9/L', 1 FROM def;

-- monosit_pct
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('monosit_pct', 'CBC', '%') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 2, 8 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'Monosit%' FROM def;

-- bazofil_abs
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('bazofil_abs', 'CBC', '10^3/uL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0.0, 0.1 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Bazofil#' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, '10^9/L', 1 FROM def;

-- bazofil_pct
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('bazofil_pct', 'CBC', '%') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0, 1 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'Bazofil%' FROM def;

-- eozinofil_abs
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('eozinofil_abs', 'CBC', '10^3/uL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0.0, 0.5 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Eozinofil#' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, '10^9/L', 1 FROM def;

-- eozinofil_pct
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('eozinofil_pct', 'CBC', '%') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 1, 4 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'Eozinofil%' FROM def;

-- nlr
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('nlr', 'CBC', 'ratio') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 1.0, 3.0 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'NLR (Nötrofil/Lenfosit Oranı)' FROM def;

-- ---------------------------------------------------------------------------
-- Chemistry
-- ---------------------------------------------------------------------------

-- glukoz
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('glukoz', 'Chemistry', 'mg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 70, 100 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Glukoz' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'mmol/L', 18.018 FROM def;

-- ure
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('ure', 'Chemistry', 'mg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 7, 20 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Kan Üre Azotu' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'mmol/L', 2.801 FROM def;

-- kreatinin
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('kreatinin', 'Chemistry', 'mg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0.6, 1.2 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Kreatinin' FROM def
)
, conv1 AS (
  INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
  SELECT id, 'umol/L', 0.01131 FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'µmol/L', 0.01131 FROM def;

-- sodyum
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('sodyum', 'Chemistry', 'mEq/L') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 136, 145 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Sodyum' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'mmol/L', 1 FROM def;

-- potasyum
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('potasyum', 'Chemistry', 'mEq/L') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 3.5, 5.5 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Potasyum' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'mmol/L', 1 FROM def;

-- kalsiyum
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('kalsiyum', 'Chemistry', 'mg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 8.5, 10.5 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Kalsiyum' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'mmol/L', 4.008 FROM def;

-- fosfor
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('fosfor', 'Chemistry', 'mg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 2.5, 4.5 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Fosfor' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'mmol/L', 3.097 FROM def;

-- magnezyum
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('magnezyum', 'Chemistry', 'mg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 1.7, 2.2 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Magnezyum' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'mmol/L', 2.431 FROM def;

-- urik_asit
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('urik_asit', 'Chemistry', 'mg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 3.5, 7.2 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Ürik Asit' FROM def
)
, conv1 AS (
  INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
  SELECT id, 'umol/L', 0.01681 FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'µmol/L', 0.01681 FROM def;

-- albumin
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('albumin', 'Chemistry', 'g/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 3.5, 5.5 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Albümin' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'g/L', 0.1 FROM def;

-- total_protein
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('total_protein', 'Chemistry', 'g/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 6.0, 8.3 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Total Protein' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'g/L', 0.1 FROM def;

-- egfr
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('egfr', 'Chemistry', 'mL/min/1.73m²') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 90, 120 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'eGFR (Glomerüler Filtrasyon Hızı)' FROM def;

-- klorur
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('klorur', 'Chemistry', 'mEq/L') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 98, 106 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Klorür' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'mmol/L', 1 FROM def;

-- ---------------------------------------------------------------------------
-- Liver
-- ---------------------------------------------------------------------------

-- alt
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('alt', 'Liver', 'U/L') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 7, 56 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'ALT (Alanin Aminotransferaz)' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'µkat/L', 60 FROM def;

-- ast
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('ast', 'Liver', 'U/L') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 10, 40 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'AST (Aspartat Transaminaz)' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'µkat/L', 60 FROM def;

-- ggt
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('ggt', 'Liver', 'U/L') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 9, 48 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'GGT (Gamma Glutamil Transferaz)' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'µkat/L', 60 FROM def;

-- alp
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('alp', 'Liver', 'U/L') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 44, 147 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'ALP (Alkalen Fosfataz)' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'µkat/L', 60 FROM def;

-- ldh
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('ldh', 'Liver', 'U/L') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 140, 280 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'LDH (Laktik Dehidrogenaz)' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'µkat/L', 60 FROM def;

-- total_bilirubin
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('total_bilirubin', 'Liver', 'mg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0.1, 1.2 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Total Bilirubin' FROM def
)
, conv1 AS (
  INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
  SELECT id, 'umol/L', 0.05848 FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'µmol/L', 0.05848 FROM def;

-- direkt_bilirubin
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('direkt_bilirubin', 'Liver', 'mg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0.0, 0.3 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Direkt Bilirubin' FROM def
)
, conv1 AS (
  INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
  SELECT id, 'umol/L', 0.05848 FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'µmol/L', 0.05848 FROM def;

-- ---------------------------------------------------------------------------
-- Lipid
-- ---------------------------------------------------------------------------

-- total_kolesterol
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('total_kolesterol', 'Lipid', 'mg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0, 200 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Total Kolesterol' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'mmol/L', 38.67 FROM def;

-- ldl
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('ldl', 'Lipid', 'mg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0, 100 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'LDL Kolesterol' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'mmol/L', 38.67 FROM def;

-- hdl
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('hdl', 'Lipid', 'mg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 40, 60 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'HDL Kolesterol' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'mmol/L', 38.67 FROM def;

-- trigliserid
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('trigliserid', 'Lipid', 'mg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0, 150 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Trigliserid' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'mmol/L', 88.57 FROM def;

-- vldl
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('vldl', 'Lipid', 'mg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 2, 30 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'VLDL Kolesterol' FROM def;

-- non_hdl
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('non_hdl', 'Lipid', 'mg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0, 130 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'Non-HDL Kolesterol' FROM def;

-- ---------------------------------------------------------------------------
-- Inflammation
-- ---------------------------------------------------------------------------

-- crp
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('crp', 'Inflammation', 'mg/L') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0, 5 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'CRP (C-Reaktif Protein)' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'mg/dL', 10 FROM def;

-- sedimantasyon
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('sedimantasyon', 'Inflammation', 'mm/saat') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0, 20 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Sedimantasyon' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'mm/h', 1 FROM def;

-- ---------------------------------------------------------------------------
-- Thyroid
-- ---------------------------------------------------------------------------

-- tsh
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('tsh', 'Thyroid', 'µIU/mL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0.4, 4.0 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'TSH' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'mIU/L', 1 FROM def;

-- serbest_t3
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('serbest_t3', 'Thyroid', 'pg/mL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 2.0, 4.4 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Serbest T3' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'pmol/L', 0.651 FROM def;

-- serbest_t4
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('serbest_t4', 'Thyroid', 'ng/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0.93, 1.7 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Serbest T4' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'pmol/L', 0.0777 FROM def;

-- ---------------------------------------------------------------------------
-- Iron
-- ---------------------------------------------------------------------------

-- demir
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('demir', 'Iron', 'µg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 60, 170 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Demir' FROM def
)
, conv1 AS (
  INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
  SELECT id, 'umol/L', 5.585 FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'µmol/L', 5.585 FROM def;

-- ferritin
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('ferritin', 'Iron', 'ng/mL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 20, 250 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Ferritin' FROM def
)
, conv1 AS (
  INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
  SELECT id, 'µg/L', 1 FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'pmol/L', 0.445 FROM def;

-- tdbk
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('tdbk', 'Iron', 'µg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 250, 370 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'TDBK (Total Demir Bağlama Kapasitesi)' FROM def;

-- transferrin_sat
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('transferrin_sat', 'Iron', '%') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 20, 50 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'Transferrin Satürasyonu' FROM def;

-- ---------------------------------------------------------------------------
-- Vitamins
-- ---------------------------------------------------------------------------

-- b12
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('b12', 'Vitamins', 'pg/mL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 200, 900 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Vitamin B12' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'pmol/L', 1.355 FROM def;

-- vitamin_d
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('vitamin_d', 'Vitamins', 'ng/mL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 30, 100 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Vitamin D' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'nmol/L', 0.4006 FROM def;

-- folik_asit
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('folik_asit', 'Vitamins', 'ng/mL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 3.0, 17.0 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Folik Asit' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'nmol/L', 0.4413 FROM def;

-- ---------------------------------------------------------------------------
-- Coagulation
-- ---------------------------------------------------------------------------

-- pt
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('pt', 'Coagulation', 'saniye') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 11, 13.5 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Protrombin Zamanı' FROM def
)
, conv1 AS (
  INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
  SELECT id, 's', 1 FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'sec', 1 FROM def;

-- aptt
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('aptt', 'Coagulation', 'saniye') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 25, 35 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'APTT (Parsiyel Tromboplastin Zamanı)' FROM def
)
, conv1 AS (
  INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
  SELECT id, 's', 1 FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'sec', 1 FROM def;

-- inr
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('inr', 'Coagulation', 'ratio') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 0.8, 1.2 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'INR' FROM def;

-- fibrinojen
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('fibrinojen', 'Coagulation', 'mg/dL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 200, 400 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'Fibrinojen' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'g/L', 100 FROM def;

-- ---------------------------------------------------------------------------
-- Other
-- ---------------------------------------------------------------------------

-- hba1c
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('hba1c', 'Other', '%') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 4.0, 5.6 FROM def
)
, tr AS (
  INSERT INTO metric_translations (metric_definition_id, locale, display_name)
  SELECT id, 'tr', 'HbA1c (Glikozile Hemoglobin)' FROM def
)
INSERT INTO metric_unit_conversions (metric_definition_id, from_unit, factor)
SELECT id, 'mmol/mol', 0.09148 FROM def;

-- parathormon
WITH def AS (
  INSERT INTO metric_definitions (key, category, canonical_unit)
  VALUES ('parathormon', 'Other', 'pg/mL') RETURNING id
)
, rng AS (
  INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
  SELECT id, NULL, NULL, NULL, 15, 65 FROM def
)
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', 'Parathormon (PTH)' FROM def;

-- ============================================================================
-- 5. BACKFILL metric_aliases.metric_definition_id
-- ============================================================================
-- Match existing aliases to new definitions via Turkish translation display_name
UPDATE metric_aliases ma
SET metric_definition_id = md.id
FROM metric_definitions md
JOIN metric_translations mt ON mt.metric_definition_id = md.id AND mt.locale = 'tr'
WHERE ma.canonical_name = mt.display_name
  AND ma.metric_definition_id IS NULL;

-- ============================================================================
-- 6. INDEXES
-- ============================================================================
-- idx_metric_definitions_key omitted: UNIQUE(key) already creates a B-tree index
CREATE INDEX idx_metric_ref_ranges_def ON metric_ref_ranges(metric_definition_id);
CREATE INDEX idx_metric_translations_def ON metric_translations(metric_definition_id);
CREATE INDEX idx_metric_unit_conversions_def ON metric_unit_conversions(metric_definition_id);
CREATE INDEX idx_metric_aliases_def ON metric_aliases(metric_definition_id);
CREATE INDEX idx_metrics_def ON metrics(metric_definition_id);

-- ============================================================================
-- 8. Unit aliases — different notation for the same unit (no value conversion)
-- ============================================================================

CREATE TABLE IF NOT EXISTS metric_unit_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias TEXT NOT NULL UNIQUE,
  canonical_unit TEXT NOT NULL
);

INSERT INTO metric_unit_aliases (alias, canonical_unit) VALUES
  ('UI/L', 'U/L'),
  ('x10E9/L', '10^3/uL'),
  ('x10E12/L', '10^6/uL'),
  ('mU/L', 'µIU/mL'),
  ('ml/min/1.73 m2', 'mL/min/1.73m²'),
  ('mm/saat', 'mm/saat')
ON CONFLICT (alias) DO NOTHING;

COMMIT;
