# ViziAI

AI-powered blood test PDF analyzer with visual health insights. Built for tracking dad's blood test trends.

## On Session Start

1. Use `/notion` skill to check tasks with topic `viziai`
2. Show pending tasks and ask: "Work on these or something else?"

## Git Workflow Rules

**CRITICAL - NEVER commit directly to main branch.**

1. `git status` - Check current branch and uncommitted changes
2. `git log --oneline -5` - See recent commits
3. `gh pr list` - Check for open PRs on this repo

**Before making ANY changes, ask the user:**

- "Should I continue on `[current-branch]` or create a new branch?"
- If there's an open PR, ask: "PR #X is still open. Continue on this branch or wait for merge?"
- If on `main`, **ALWAYS create a new feature branch first**

**Branch naming:** `feature/descriptive-name` or `fix/issue-description`

```bash
# Example: Always start work on a new branch
git checkout -b feature/upload-improvements
```

**Never:**

- Commit directly to `main`
- Push to `main` without explicit user approval
- Continue on a branch without checking PR status first

## Database Migrations

**ALWAYS use Neon branching for migrations:**

1. **Create a branch in Neon Console:**
   - Go to https://console.neon.tech → Your project → Branches
   - Click "Create Branch" → name it `dev` or `migration-test`
   - Copy the branch connection string

2. **Test migration on branch:**

   ```bash
   # Set branch URL temporarily
   export NEON_DATABASE_URL="postgres://...branch-url..."

   # Run migration
   psql $NEON_DATABASE_URL -f db-schema/migrations/YYYYMMDD_migration_name.sql
   ```

3. **Verify it worked:**
   - Check tables exist
   - Test the app locally against the branch

4. **Apply to production:**

   ```bash
   # Use prod URL
   psql $NEON_DATABASE_URL -f db-schema/migrations/YYYYMMDD_migration_name.sql
   ```

5. **Delete the test branch** (optional, Neon has free tier limits)

**Why:** Neon branches are instant copies of your database. If migration fails, prod is untouched. Point-in-time recovery is available but branching is easier.

## Tech Stack

- **Framework**: Next.js 15 (App Router) - handles both frontend AND backend
- **Database**: Neon Postgres (serverless)
- **Auth**: NextAuth.js with Google OAuth
- **Async Jobs**: Upstash QStash (PDF extraction queue)
- **AI**: OpenAI gpt-5-mini (extracts lab values from PDF images)
- **Storage**: Vercel Blob (temporary PDF storage)
- **Hosting**: Vercel

## Project Structure

```
viziai/
├── web/                 # Next.js app (the entire application)
│   ├── src/app/         # Pages and API routes
│   ├── src/components/  # React components
│   ├── src/lib/         # Utilities (auth, db, etc.)
│   └── messages/        # i18n locale files (tr, en, es, de, fr)
├── scripts/             # Operational scripts (metric normalization, etc.)
├── db-schema/           # SQL migrations for Neon
├── product/             # Brand guidelines, roadmap
├── ralph/               # Ralph autonomous agent loop files
│   ├── ralph.sh         # Loop script
│   ├── prompt.md        # Per-iteration instructions
│   ├── prd.json         # Story list with status tracking
│   └── progress.txt     # Learnings log
├── AGENTS.md            # Project patterns for Ralph iterations
└── _legacy/             # Archived Python code
```

## Key Files

- **Pages**: `web/src/app/` (dashboard, upload, settings, login)
- **API routes**: `web/src/app/api/` (all backend logic)
- **Auth**: `web/src/lib/auth.ts`
- **Database**: `web/src/lib/db.ts`
- **PDF extraction**: `web/src/app/api/upload/[id]/extract/worker/route.ts`

## Metric Name Normalization

Same blood test can appear under different names across lab PDFs (e.g., "Potasiyum", "POTASYUM (SERUM/PLAZMA)", "Potaszyum" are all Potasyum). We handle this with a curated alias table + inline suggestions in the upload review step.

**How it works:**

1. `metric_aliases` table maps known misspellings/variants to canonical names (`alias → canonical_name`, global, not per-user)
2. During upload review, `GET /api/aliases` fetches the alias map
3. Extracted metric names are auto-renamed to canonical names, with an inline suggestion row showing the rename (switch toggle to revert)
4. User confirms → metric saved with the canonical name

**Key:** The alias table is admin-curated (we add entries via SQL when we spot patterns from real uploads). Users can only accept/reject suggestions, not create aliases.

**Files:**

- `scripts/metric-normalization/` — workflow docs, merge script, completed merges checklist
- `db-schema/migrations/20260212_metric_aliases_global.sql` — alias table schema
- `web/src/app/api/aliases/route.ts` — GET endpoint returning alias map
- `web/src/app/upload/page.tsx` — inline suggestion UI in review table

## Environment Variables (Vercel)

Required for deployment:

- `NEON_DATABASE_URL` - Neon connection string
- `NEXTAUTH_URL` - Production: `https://www.viziai.app`, Preview: `https://staging.viziai.app`
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `OPENAI_API_KEY` - For PDF extraction (gpt-5-mini)
- `QSTASH_URL` - Upstash QStash endpoint
- `QSTASH_TOKEN` - Upstash QStash token
- `QSTASH_CURRENT_SIGNING_KEY` - For request verification
- `QSTASH_NEXT_SIGNING_KEY` - For key rotation

**IMPORTANT:** When adding env vars via Vercel UI, ensure NO trailing newlines. Use CLI:

```bash
echo -n "value" | npx vercel env add VAR_NAME production
```

## Profile Access

Any Google account can sign in. Profile access is granted via the `profile_allowed_emails` table -- on sign-in, the user auto-claims any profiles linked to their email.

## Domains

| Environment | Domain                          | Purpose                                              |
| ----------- | ------------------------------- | ---------------------------------------------------- |
| Production  | `viziai.app` / `www.viziai.app` | Live app, auto-deploys on merge to main              |
| Staging     | `staging.viziai.app`            | Preview deploys from feature branches, OAuth enabled |
| Local       | `localhost:3000`                | Local dev                                            |

**Google Analytics**: `G-TWM75R9VKP` (viziai.app property, Stream ID: 13682442084)

## Deployment

**CRITICAL — NEVER use `npx vercel --prod` or Vercel CLI to deploy.**

The CLI build produces a broken output (only a 404 page, no App Router routes). Deployments happen automatically when code is pushed/merged to `main` via GitHub integration.

- **Production deploy:** Merge PR to `main` → Vercel auto-deploys to `viziai.app`
- **Staging deploy:** Push to any feature branch → Vercel preview at `staging.viziai.app`
- **To redeploy:** Use `npx vercel redeploy <deployment-url>` to re-promote a known-good deployment
- **If you accidentally CLI-deployed:** Find the last good auto-deploy with `npx vercel ls --prod`, then `npx vercel redeploy <that-url>`

### Google OAuth Redirect URIs

In Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client, these redirect URIs must be registered:

```
https://www.viziai.app/api/auth/callback/google
https://staging.viziai.app/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

## Ralph (Autonomous Agent Loop)

Ralph is an autonomous development agent that implements stories from `ralph/prd.json`. Each iteration spawns a fresh Claude instance that picks one story, implements it through a 7-phase pipeline, commits, and pushes.

**Files:** `ralph/` directory (ralph.sh, prompt.md, prd.json, progress.txt)
**Patterns:** `AGENTS.md` (project root)

**Run:** `./ralph/ralph.sh 15`
**Monitor:** `tail -f ralph/progress.txt`

### Per-story pipeline

```
Phase 1: BUILD         /workflows:work
Phase 2: DESIGN REVIEW 3 parallel agents (UI stories only)
Phase 3: CODE REVIEW   /workflows:review
Phase 4: FIX FINDINGS  /resolve_todo_parallel
Phase 5: TESTS         typecheck + lint + unit tests + build
Phase 6: BROWSER TEST  /test-browser (UI stories only)
Phase 7: SHIP          single commit + git push → staging.viziai.app preview
```

## Security Checklist (Every Feature)

Before writing or modifying any API route, check these:

### Access Control

- **Always use `requireAuth()`** — every API route must authenticate the user first
- **Always check profile access** — use `getProfileAccessLevel()` (not just `hasProfileAccess()`) when the operation modifies data
- **Enforce access levels**: `owner`/`editor` for write operations (PUT/POST/DELETE), `viewer` is read-only
- **Verify ownership of the resource** — look up the resource's `profile_id`, then check the user has access to that profile. Never trust client-sent `profileId` for write operations without verifying access

### IDOR Prevention

- When a route takes a resource ID (e.g., `/api/tracking/[id]`), always fetch the resource first, get its `profile_id`, then verify the current user has access to that profile
- Never assume that because a user is authenticated, they can access any resource

### Input Validation

- Validate all numeric inputs have sane ranges (e.g., weight 1-500, systolic 50-300)
- Validate enum/type fields against allowed values
- Don't trust client-sent `type` or `measured_at` fields for updates — read from DB

### How It Works

```
Request → requireAuth() → get resource → getProfileAccessLevel() → check level → proceed
```

**Auth helpers** (`web/src/lib/auth.ts`):

- `requireAuth()` — returns userId or null (from session JWT)
- `hasProfileAccess(userId, profileId)` — boolean, any access level
- `getProfileAccessLevel(userId, profileId)` — returns `"owner" | "editor" | "viewer" | null`
- `requireProfileOwner(profileId)` — returns userId only if owner

**Access levels**: `owner` > `editor` > `viewer`. Viewers can only read. Editors can read + write. Owners can read + write + manage access.

## Frontend & Design Work

Before any UI/design changes, reference:

- `product/brand-guidelines/BRAND.md` - Colors, typography, voice & tone
- `product/PROJECT-ROADMAP.md` - Feature roadmap and priorities

**Key brand rules:**

- Primary: Teal (#0D9488 light / #2DD4BF dark)
- Secondary/Accent: Coral (#F97066 light / #FDA4AF dark)
- Status colors: Green (normal), Amber (warning), Terracotta (critical - NOT bright red)
- Font: Inter with Turkish support
- Tone: Clear, calm, reassuring - never alarming

## Notes

- Low-activity personal project
- Data is dad's blood test results (Turkish lab reports)
- All 1770 records migrated from Supabase to Neon
