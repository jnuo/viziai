# AGENTS.md - Project Patterns for Ralph Iterations

Each Ralph iteration spawns a fresh Claude instance. This file ensures every instance understands the codebase without re-discovering patterns.

## Current Phase: Metric Translations & Descriptions

Branch: `feature/metric-translations`
Stories: `ralph/prd.json` (MT-001 through MT-012)

**This is a DATA project, not a CODE project.** All stories produce SQL files that populate the `metric_translations` table with descriptions and multi-locale translations.

### Database: Neon TEST Branch

**ALL database operations use the test branch, NOT production.**

```bash
PSQL="/opt/homebrew/opt/libpq/bin/psql"
TEST_DB="postgresql://neondb_owner:npg_iO7Ip6GYlnaT@ep-dry-firefly-ag9z6ef3.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Query:
$PSQL "$TEST_DB" -c "SELECT ..."

# Apply SQL file:
$PSQL "$TEST_DB" -f db-schema/data/metric-translations/MT-XXX-file.sql
```

### Key Tables

- `metric_definitions` — 155 metrics with key, category, canonical_unit, value_type
- `metric_translations` — locale-specific display_name and description (new column)
- `metric_aliases` — maps variant names to canonical names

### What This Project Does

1. Adds `description` column to `metric_translations`
2. Normalizes categories (22 mixed English/Turkish → 16 consistent Turkish slugs)
3. Generates Turkish patient-facing descriptions for all 155 metrics
4. Adds full translations (display_name + description) for EN, ES, DE, FR, NL
5. Target: 155 × 6 locales = 930 translation rows

### SQL Output Directory

All SQL files go to: `db-schema/data/metric-translations/`

## Tech Stack

- **Framework**: Next.js 15 (App Router) with Turbopack
- **Language**: TypeScript (strict)
- **Database**: Neon Postgres (serverless, HTTP driver via `@neondatabase/serverless`)
- **Auth**: NextAuth.js v4 with Google OAuth
- **i18n**: next-intl v4 (server-first, locale stored in cookie)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Hosting**: Vercel (auto-deploys from GitHub on merge to main)

## Project Structure

```
viziai/
├── web/                      # Next.js app (everything)
│   ├── src/app/              # Pages and API routes (App Router)
│   ├── src/components/       # React components (shadcn/ui pattern)
│   ├── src/lib/              # Utilities (auth.ts, db.ts)
│   ├── messages/             # i18n locale files (tr, en, es, de, fr, nl)
│   └── src/i18n/config.ts    # Locale definitions
├── db-schema/
│   ├── migrations/           # DDL migration files
│   └── data/                 # DML data files (NEW)
│       └── metric-translations/  # SQL files from this project
├── ralph/                    # Ralph autonomous agent files
│   ├── ralph.sh              # Loop script
│   ├── prompt.md             # Per-iteration instructions (has DESCRIPTION_PROMPT)
│   ├── prd.json              # Story list with status tracking
│   └── progress.txt          # Append-only learnings log
└── AGENTS.md                 # This file
```

## Description Rules (CRITICAL)

All metric descriptions MUST follow these rules:

1. **Function-first**: What the substance IS and DOES in the body
2. **No disease names**: Never mention diyabet, kanser, anemi, lösemi, siroz, etc.
3. **No diagnoses**: Never say "if high, you might have..."
4. **No scary words**: Never use tehlikeli, ciddi, endişe verici
5. **Max 30 words**, max 2 sentences
6. **Reading level**: Middle school (ortaokul)
7. **Tone**: Calm, informative, reassuring

See `ralph/prompt.md` → DESCRIPTION_PROMPT section for full template and examples.

## Category Normalization

These English categories must be renamed to Turkish slugs:

| Old          | New                |
| ------------ | ------------------ |
| CBC          | hemogram           |
| Chemistry    | biyokimya          |
| Liver        | karaciger          |
| Lipid        | lipid              |
| Coagulation  | koagulasyon        |
| Iron         | demir              |
| Vitamins     | vitamin            |
| Thyroid      | tiroid             |
| Inflammation | enflamasyon        |
| Other        | diger              |
| tumor_marker | tumor_belirtecleri |
| kardiyoloji  | kardiyak           |

Categories already correct (no change): hemogram, biyokimya, karaciger, idrar, immunoloji, kan_gazi, hormon, koagulasyon, enflamasyon, demir

## Story Execution Pipeline (Simplified)

No UI work in this project. Simplified 3-phase pipeline:

```
Phase 1: BUILD    — Query DB, generate SQL, apply to test branch
Phase 2: VERIFY   — Run verification queries, spot-check quality
Phase 3: SHIP     — Commit SQL file + push
```

## SQL Patterns

### Turkish descriptions (UPDATE existing rows):

```sql
UPDATE metric_translations SET description = 'Description here...'
WHERE metric_definition_id = (SELECT id FROM metric_definitions WHERE key = 'metric_key')
  AND locale = 'tr';
```

### New locale translations (INSERT with upsert):

```sql
INSERT INTO metric_translations (metric_definition_id, locale, display_name, description)
SELECT id, 'en', 'English Name', 'English description...'
FROM metric_definitions WHERE key = 'metric_key'
ON CONFLICT (metric_definition_id, locale) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;
```

## Supported Locales

| Code | Language | Status                              |
| ---- | -------- | ----------------------------------- |
| tr   | Turkish  | Has display_name, needs description |
| en   | English  | Needs display_name + description    |
| es   | Spanish  | Needs display_name + description    |
| de   | German   | Needs display_name + description    |
| fr   | French   | Needs display_name + description    |
| nl   | Dutch    | Needs display_name + description    |

## Quality Checks

```bash
cd web && npm run typecheck && npm run lint && npm run build
```

## Deployment

- **Never deploy via CLI** — Vercel auto-deploys from GitHub
- After each story: `git push` → Vercel preview deploy
- This branch only has SQL data files — no code changes expected

## Commit Convention

```
data(MT-XXX): Brief description

- What was generated
- Metric count and verification

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Common Gotchas

1. **Never write to production DB** — ALL writes go to test branch
2. **Neon HTTP driver** — No `sql.begin()`. Use sequential queries.
3. **next-intl** — All message keys must exist in ALL locale files or the build fails.
4. **Single quotes in SQL** — Turkish descriptions may contain apostrophes. Use $$ quoting or escape with ''.
5. **Turkish characters** — İ, ı, ğ, ü, ş, ö, ç must be preserved correctly in SQL files (UTF-8).
