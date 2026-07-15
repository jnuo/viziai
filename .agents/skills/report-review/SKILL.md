---
name: report-review
description: Review blood test reports from the admin quality dashboard — audit metrics against definitions, check units, research unknowns, and link everything to the metric_definitions table. Use this skill whenever Onur asks to "review a report", "audit metrics", "check this report", or references the admin quality page reports. Also use when he asks to run the audit script or link metrics for a specific report.
---

# Report Review Workflow

You are reviewing a blood test report's extracted metrics against the `metric_definitions` system. The goal: every metric in the report should be linked to a definition via `metric_definition_id`. Each review grows the alias/definition tables, making future reports auto-match better.

## Environment

- **psql**: `/opt/homebrew/opt/libpq/bin/psql`
- **Audit script**: `scripts/audit-report-metrics.py` (Python 3, takes optional `report_id` argument)
- **Key tables**: `metric_definitions`, `metric_ref_ranges`, `metric_translations`, `metric_aliases`, `metric_unit_aliases`, `metric_unit_conversions`, `metrics`

### Database: Dev vs Production

**CRITICAL: Dev and production are DIFFERENT Neon databases with DIFFERENT data.**

| Environment | Endpoint | When to use |
|-------------|----------|-------------|
| **Dev** (`ep-super-king`) | Read from `web/.env.local` → `NEON_DATABASE_URL` | Audit script (read-only exploration), testing |
| **Production** (`ep-wispy-pine`) | Pull via `npx vercel env pull` or use known prod URL | ALL writes: definitions, aliases, unit aliases, linking metrics, marking reviews |

**Default behavior:**
- Run the **audit script** against **dev** (it's read-only, fine for exploration)
- Run **ALL SQL writes** (INSERT/UPDATE) against **production** — this is where the app reads from
- The admin dashboard at `viziai.app` reads from production, so reviews/linking must happen there

**How to get prod URL:** Run `npx vercel env pull .env.prod.tmp --yes` in `web/`, extract `NEON_DATABASE_URL`, then delete the temp file. Or use the known prod endpoint `ep-wispy-pine-aguzvsof.c-2.eu-central-1.aws.neon.tech`.

**Never assume dev and prod have the same definitions/aliases.** After adding data to prod, verify it worked on prod — don't check dev as confirmation.

## Step 1: Identify the Report

If Onur doesn't give a report ID, find it:

```sql
SELECT r.id, r.file_name, r.created_at, r.sample_date
FROM reports r ORDER BY r.created_at DESC LIMIT 10;
```

Confirm with Onur which report to review.

## Step 2: Run the Audit

```bash
NEON_DATABASE_URL="<url>" python3 scripts/audit-report-metrics.py <report_id>
```

This runs a multi-pass matching algorithm:

- **Pass 1**: Exact alias match (case-insensitive) against `metric_aliases`
- **Pass 2**: Exact translation match against `metric_translations` (Turkish `display_name`)
- **Pass 3**: Normalized match — strips parenthetical method names, normalizes Turkish chars (İ→I, ı→i, ğ→g, ü→u, ş→s, ö→o, ç→c), lowercases
- **Pass 4**: Abbreviation extraction — pulls uppercase abbreviations from parens like "Alanin aminotransferaz (ALT)" → "ALT"
- **Pass 5**: Token overlap (>=70%) with unit/ref range similarity check → POTENTIAL

## Step 3: Present the Full Table

Show ALL metrics in a single markdown table with these columns:

| #   | Metric Name | Value | Unit | Ref Range | Match Type | Matched Via | Definition Key |
| --- | ----------- | ----- | ---- | --------- | ---------- | ----------- | -------------- |

- **Match Type**: ALIAS, TRANSLATION, NORMALIZED, ABBREVIATION, POTENTIAL, or UNKNOWN
- **Matched Via**: The specific alias text, translation display_name, or normalization path that matched
- **Definition Key**: The `metric_definitions.key` (e.g., `hemoglobin`, `crp`, `alt`)

Group matched metrics first, then unknowns at the bottom.

## Step 4: Check Units

For every matched metric, compare the report's unit against the definition's `canonical_unit`. Check `metric_unit_aliases` for notation equivalences (e.g., `UI/L` = `U/L`, `x10E9/L` = `10^3/uL`).

Present a unit comparison table for any that don't trivially match:

| Metric  | Report Unit | Canonical Unit | Status                   |
| ------- | ----------- | -------------- | ------------------------ |
| ALP     | UI/L        | U/L            | Same (notation alias)    |
| Albumin | g/L         | g/dL           | CONVERSION NEEDED (×0.1) |

- **Same**: notation difference only, already in `metric_unit_aliases` or trivially equivalent
- **NEW ALIAS NEEDED**: same unit, different notation, not yet in `metric_unit_aliases` → propose adding it
- **CONVERSION NEEDED**: actual numeric conversion required → check `metric_unit_conversions` or propose adding one

## Step 5: Research Unknowns

For each UNKNOWN metric, research online:

1. **Standard English name** and **Turkish name** (how it appears on Turkish lab reports)
2. **Reference range** for adults (use the most commonly cited clinical range)
3. **Standard unit**
4. **Common aliases** that might appear on different lab reports
5. **Value type**: `quantitative` (numeric, trends over time on charts) or `qualitative` (categorical like blood type, positive/negative serology with no numeric scale). If a metric has numeric reference ranges, it's quantitative — even if labs sometimes report "Negatif" instead of a number (that's an extraction issue, not a classification issue).

Use web search for verification. Search both English ("urine albumin reference range") and Turkish ("idrar albumin referans degerleri") sources.

Check if any UNKNOWN metric is actually a variant of an existing definition (e.g., "Kolesterol" is just "Total Kolesterol" without the prefix — needs an alias, not a new definition).

## Step 6: Present Final Proposal

Show Onur the complete proposal before writing anything to DB:

### For matched metrics:

"I'll set `metric_definition_id` on these N metrics in the `metrics` table."

### For unknowns that map to existing definitions:

"I'll add these aliases to existing definitions: [list]"

### For unknowns needing new definitions:

Table with: key, Turkish name, category, canonical unit, value_type, ref_low, ref_high, proposed aliases

### For new unit aliases:

Table with: alias, canonical_unit

**Wait for Onur's explicit confirmation before proceeding.**

## Step 7: Execute (After Confirmation)

Run these SQL operations in order:

### 7a: Add new unit aliases

```sql
INSERT INTO metric_unit_aliases (alias, canonical_unit) VALUES (...) ON CONFLICT (alias) DO NOTHING;
```

### 7b: Create new metric definitions

```sql
INSERT INTO metric_definitions (key, category, canonical_unit, value_type) VALUES (...) ON CONFLICT (key) DO NOTHING;
```

### 7c: Add reference ranges

```sql
INSERT INTO metric_ref_ranges (metric_definition_id, sex, age_min, age_max, ref_low, ref_high)
SELECT id, NULL::text, NULL::int, NULL::int, <low>, <high> FROM metric_definitions WHERE key = '<key>';
```

### 7d: Add Turkish translations

```sql
INSERT INTO metric_translations (metric_definition_id, locale, display_name)
SELECT id, 'tr', '<display_name>' FROM metric_definitions WHERE key = '<key>'
ON CONFLICT (metric_definition_id, locale) DO NOTHING;
```

### 7e: Add aliases

```sql
INSERT INTO metric_aliases (alias, canonical_name, metric_definition_id)
SELECT '<alias>', '<canonical_name>', id FROM metric_definitions WHERE key = '<key>'
ON CONFLICT (alias) DO NOTHING;
```

### 7f: Link matched metrics (via alias)

```sql
UPDATE metrics m SET metric_definition_id = ma.metric_definition_id
FROM metric_aliases ma
WHERE m.report_id = '<report_id>'
  AND LOWER(ma.alias) = LOWER(m.name)
  AND ma.metric_definition_id IS NOT NULL
  AND m.metric_definition_id IS NULL;
```

### 7g: Link matched metrics (via translation)

```sql
UPDATE metrics m SET metric_definition_id = mt.metric_definition_id
FROM metric_translations mt
WHERE m.report_id = '<report_id>'
  AND LOWER(mt.display_name) = LOWER(m.name)
  AND mt.locale = 'tr'
  AND m.metric_definition_id IS NULL;
```

### 7h: Link matched metrics (via normalized — strip parenthetical)

```sql
WITH normalized_aliases AS (
  SELECT alias, metric_definition_id,
         LOWER(TRIM(regexp_replace(alias, '\s*\([^)]*\)', '', 'g'))) as norm_alias
  FROM metric_aliases WHERE metric_definition_id IS NOT NULL
)
UPDATE metrics m SET metric_definition_id = na.metric_definition_id
FROM normalized_aliases na
WHERE m.report_id = '<report_id>'
  AND LOWER(TRIM(regexp_replace(m.name, '\s*\([^)]*\)', '', 'g'))) = na.norm_alias
  AND m.metric_definition_id IS NULL;
```

## Step 8: Verify

```sql
SELECT COUNT(*) as total, COUNT(metric_definition_id) as linked,
       COUNT(*) - COUNT(metric_definition_id) as unlinked
FROM metrics WHERE report_id = '<report_id>';
```

Report the final count. Target: 0 unlinked.

## Important Notes

- **Never write to DB without confirmation.** Always present the proposal first.
- **Turkish characters matter.** The matching algorithm normalizes İ→I, ı→i, ğ→g, ü→u, ş→s, ö→o, ç→c for comparison but stores original text in the database.
- **Unit aliases vs conversions**: A unit alias means "same unit, different notation" (no value change). A unit conversion means "different unit, multiply by factor" (value changes). Don't confuse them.
- **Kolesterol pattern**: Watch for metrics that are just a prefix-less variant of an existing definition (e.g., "Kolesterol" = "Total Kolesterol"). These need an alias to the existing definition, NOT a new definition.
- **Categories**: Use lowercase slugs — `hemogram`, `biyokimya`, `lipid`, `karaciger`, `tiroid`, `demir`, `vitamin`, `koagulasyon`, `idrar`, `immunoloji`, `hormon`, `enflamasyon`
