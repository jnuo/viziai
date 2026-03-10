# AGENTS.md - Project Patterns for Ralph Iterations

Each Ralph iteration spawns a fresh Claude instance. This file ensures every instance understands the codebase without re-discovering patterns.

## Current Phase: Extraction Quality System (#105 + #106)

Branch: `feature/extraction-quality-system`
Stories: `ralph/prd.json` (QS-001 through QS-020)

## Tech Stack

- **Framework**: Next.js 15 (App Router) with Turbopack
- **Language**: TypeScript (strict)
- **Database**: Neon Postgres (serverless, HTTP driver via `@neondatabase/serverless`)
- **Auth**: NextAuth.js v4 with Google OAuth
- **i18n**: next-intl v4 (server-first, locale stored in cookie)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **AI**: OpenAI gpt-5-mini (PDF extraction)
- **Async Jobs**: Upstash QStash
- **Hosting**: Vercel (auto-deploys from GitHub on merge to main)

## Project Structure

```
viziai/
├── web/                      # Next.js app (everything)
│   ├── src/app/              # Pages and API routes (App Router)
│   ├── src/components/       # React components (shadcn/ui pattern)
│   ├── src/lib/              # Utilities (auth.ts, db.ts)
│   ├── messages/             # i18n locale files (tr.json, en.json, es.json)
│   └── src/i18n/config.ts    # Locale definitions
├── db-schema/migrations/     # SQL migration files for Neon
├── scripts/                  # Operational scripts
├── product/                  # Brand guidelines, roadmap
├── ralph/                    # Ralph autonomous agent files
│   ├── ralph.sh              # Loop script (spawns Claude iterations)
│   ├── prompt.md             # Per-iteration instructions
│   ├── prd.json              # Story list with status tracking
│   └── progress.txt          # Append-only learnings log
└── AGENTS.md                 # Project patterns for Ralph iterations
```

## i18n Pattern (next-intl)

### Adding a new locale

1. Add locale code to `web/src/i18n/config.ts`:
   ```ts
   export const locales = ["tr", "en", "es", "de", "fr"] as const;
   ```
2. Add label and BCP47 tag in the same file
3. Create `web/messages/{locale}.json` with ALL keys matching `en.json` structure
4. The locale switcher in the header auto-reads from config — no UI changes needed

### Using translations in components

```tsx
// Server component
import { useTranslations } from "next-intl";
const t = useTranslations("pages.dashboard");
return <h1>{t("loadingData")}</h1>;

// With interpolation
t("hoursAgo", { count: 3 }); // "3h ago"

// With rich text
t.rich("heroTitle", {
  highlight: (chunks) => <span className="text-primary">{chunks}</span>,
});
```

### Message file structure

Messages are nested JSON. Top-level sections: `common`, `pages`, `components`, `tracking`, `api`. Always add new keys to ALL locale files.

## Database Patterns

### Neon HTTP driver

```ts
import { sql } from "@/lib/db";
const rows = await sql`SELECT * FROM reports WHERE profile_id = ${profileId}`;
```

**Important**: Neon HTTP driver does NOT support `sql.begin()`. Use sequential queries or `sql.transaction()` for non-interactive batches.

### Migration files

- Location: `db-schema/migrations/YYYYMMDD_description.sql`
- Use `BEGIN; ... COMMIT;` for transactional migrations
- See `20260212_metric_aliases_global.sql` for alias table pattern

### Metric aliases

The `metric_aliases` table maps variant names to canonical names:

```sql
INSERT INTO metric_aliases (alias, canonical_name) VALUES ('Kalium', 'Potasyum');
```

Canonical names are Turkish (the original lab report language).

## Auth Pattern

Every API route must authenticate:

```ts
import { getServerSession } from "next-auth";
import {
  authOptions,
  getDbUserId,
  hasProfileAccess,
  getProfileAccessLevel,
} from "@/lib/auth";

const session = await getServerSession(authOptions);
const userId = getDbUserId(session);
if (!userId)
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// For write operations, check access level
const level = await getProfileAccessLevel(userId, profileId);
if (!level || level === "viewer")
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

### Admin Auth Pattern

For admin-only routes (under `/api/admin/*`), use `requireAdmin()`:

```ts
import { requireAdmin } from "@/lib/auth";

const userId = await requireAdmin();
if (!userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

`requireAdmin()` checks `users.is_admin` flag in the database. Regular users get 403.

## Brand Guidelines

**Always read `product/brand-guidelines/BRAND.md` before any UI/design work.** Key rules:

- Primary: Teal (#0D9488 light / #2DD4BF dark)
- Secondary/Accent: Coral (#F97066 light / #FDA4AF dark)
- Status: Green (normal), Amber (warning), Terracotta (critical — NOT bright red)
- Logo: Always use `<ViziAILogo>` component — "Vizi" in primary + "AI" in secondary
- Font: Inter with Turkish character support
- Tone: Clear, calm, reassuring — never alarming
- Accessibility: WCAG 2.1 AA minimum

## Component Patterns

### shadcn/ui

Components live in `web/src/components/ui/`. Import as:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
```

### Brand colors (Tailwind)

- Primary: `text-primary`, `bg-primary` (Teal)
- Secondary: `text-secondary`, `bg-secondary` (Coral)
- Status: `text-status-normal` (Green), `text-status-warning` (Amber), `text-status-critical` (Terracotta — NOT bright red)
- Never use alarming colors for health data

## Quality Checks

Run these before marking any story as done:

```bash
cd web && npm run typecheck   # tsc --noEmit (after STORY-001)
cd web && npm run lint         # eslint
cd web && npm run test         # jest unit tests
cd web && npm run build        # next build --turbopack
```

All four must pass with zero errors. Do NOT skip failing tests.

## Deployment

- **Staging**: `staging.viziai.app` → points to Ralph branch preview deploys (with OAuth)
- **Production**: `viziai.app` → only via PR merge to main. Never `npx vercel --prod`
- After each story: `git push` → Vercel preview deploy → testable at `staging.viziai.app`
- Preview uses prod database (NEON_DATABASE_URL) — same data, safe for this phase

## Commit Convention

```
feat(STORY-XXX): Brief description

- What was implemented
- How it was verified

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Story Execution Pipeline

Each story goes through a multi-phase pipeline based on the `/lfg` workflow:

```
Phase 1: BUILD         /workflows:work (+ /frontend-design for UI stories)
Phase 2: DESIGN REVIEW 3 parallel agents loop until PASS (UI stories only)
Phase 3: CODE REVIEW   /workflows:review (parallel review agents)
Phase 4: FIX FINDINGS  /resolve_todo_parallel (auto-fix in parallel)
Phase 5: TESTS         typecheck + lint + unit tests + build
Phase 6: BROWSER TEST  /test-browser (UI stories only)
Phase 7: SHIP          single atomic commit + git push → Vercel preview deploy
```

Non-UI stories (SQL migrations, config, i18n-only) skip Phases 2 and 5.

### Skills Used

| Skill                    | Phase  | When to use                                                      |
| ------------------------ | ------ | ---------------------------------------------------------------- |
| `/workflows:work`        | Build  | Every story — structured execution with task tracking            |
| `/frontend-design`       | Build  | UI stories — MUST read `product/brand-guidelines/BRAND.md` first |
| `/workflows:review`      | Review | Every story — parallel code review agents                        |
| `/resolve_todo_parallel` | Fix    | If review created TODOs — auto-fix in parallel                   |
| `/test-browser`          | Test   | UI stories — verify pages in real browser                        |
| `/react-best-practices`  | Build  | React/Next.js component work                                     |
| `/writer-onur`           | Build  | SEO article content (STORY-013)                                  |

### Design Review Loop (UI stories, Phase 2)

3 parallel review agents, each responds with PASS or FAIL. Loop until all 3 pass:

```
Review (3 parallel) → All PASS? → YES → Phase 3
                        ↓ NO
                  Fix issues → Review (3 parallel) → All PASS? → ...
```

1. **Brand Compliance** — colors, logo, tone against `product/brand-guidelines/BRAND.md`
2. **Web Best Practices** — semantic HTML, WCAG AA, responsive, performance, readability
3. **Design Quality** — polish, hierarchy, elegance, not generic AI output

No iteration cap. See `ralph/prompt.md` for full agent prompts.

## Extraction Quality System

### Canonical Metrics

`web/src/lib/canonical-metrics.ts` is the source of truth for known metric names and their canonical units. Canonical names are Turkish (the original lab report language). Foreign metric names (Spanish, German, French, English) are mapped to Turkish canonical names via `metric_aliases` table.

### Unit Normalization

`web/src/lib/unit-normalization.ts` converts metric values between known unit pairs:

- `g/L → g/dL` (÷ 10) for Hemoglobin
- `mmol/L → mg/dL` (× 18.018) for Glukoz
- `µmol/L → mg/dL` (metric-specific factor) for Kreatinin, Urik Asit
- `10^9/L → 10^3/µL` (same value, rename) for Lokosit

### Unmapped Metrics

The `unmapped_metrics` table tracks metric names from uploads that don't match any alias or canonical name. Status workflow: `pending` → `mapped` (alias created) or `accepted` (genuinely new metric).

### Blob Preservation

PDFs are **no longer deleted** from Vercel Blob after confirm. The `reports.blob_url` column stores the URL for:

- Admin side-by-side review (PDF + extracted metrics)
- Re-extraction with improved prompts
- Eval dataset building

### Admin Routes

All admin routes live under `/api/admin/*` and `/admin/*`. They use `requireAdmin()` for auth. Admin pages have a shared layout at `web/src/app/admin/layout.tsx` that blocks non-admin users.

## Common Gotchas

1. **Never deploy via CLI** — `npx vercel --prod` produces broken builds. Vercel auto-deploys from GitHub.
2. **Neon HTTP driver** — No `sql.begin()`. Use sequential queries.
3. **Refs don't trigger re-renders** — Never use `disabled={ref.current}`, use state.
4. **next-intl** — All message keys must exist in ALL locale files or the build fails.
5. **Canonical metric names are Turkish** — foreign names map TO Turkish canonical names via aliases.
6. **viziai.app** — Domain is live on Vercel. Production NEXTAUTH_URL should be `https://www.viziai.app`.
7. **Blobs are preserved** — PDFs are NOT deleted after confirm. `reports.blob_url` stores the URL.
