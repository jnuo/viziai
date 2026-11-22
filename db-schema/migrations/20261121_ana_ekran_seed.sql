-- ============================================================================
-- Day-1 "Ana ekran" seeding (dashboard redesign, #158)
-- ============================================================================
-- The dashboard now shows only Ana ekran metrics (metric_preferences.is_favorite,
-- ordered by display_order). Profiles whose owners customised the metric order
-- (any display_order <> 0) get their first 8 metrics by display_order as
-- Ana ekran. Profiles that never reordered get none; the dashboard's
-- empty-state rule (biggest changes in the latest report) applies to them.
--
-- Only names that still have results in the profile count (metric_preferences
-- keeps rows for names that were later renamed / merged).
--
-- Idempotent: profiles that already have any Ana ekran metric are skipped,
-- so a second run changes nothing.
-- Apply to a Neon test branch first (see CLAUDE.md "Database Migrations").
-- ============================================================================

WITH customised AS (
  SELECT profile_id
  FROM metric_preferences
  GROUP BY profile_id
  HAVING bool_or(display_order <> 0) AND NOT bool_or(is_favorite)
), ranked AS (
  SELECT mp.id,
         row_number() OVER (
           PARTITION BY mp.profile_id ORDER BY mp.display_order, mp.name
         ) AS rn
  FROM metric_preferences mp
  JOIN customised c USING (profile_id)
  WHERE EXISTS (
    SELECT 1
    FROM metrics m
    JOIN reports r ON r.id = m.report_id
    WHERE r.profile_id = mp.profile_id AND m.name = mp.name
  )
)
UPDATE metric_preferences mp
SET is_favorite = true
FROM ranked r
WHERE mp.id = r.id
  AND r.rn <= 8;
