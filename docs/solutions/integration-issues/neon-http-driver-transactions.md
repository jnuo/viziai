---
title: "Neon HTTP driver lacks sql.begin() — use sequential deletes"
category: integration-issues
tags: [neon, serverless, transactions, sql-begin, cascade, sequential-deletes]
module: web/src/app/api/settings/files/[id]/route.ts
symptom: "Plan used sql.begin(async (tx) => {...}) which doesn't exist on Neon HTTP driver"
root_cause: "Neon's @neondatabase/serverless HTTP driver has a different API than postgres.js Pool — no .begin() method"
severity: high
date_discovered: 2026-02-20
date_resolved: 2026-02-20
related_pr: "28"
---

# Neon HTTP driver lacks sql.begin() — use sequential deletes

## Problem

When building `DELETE /api/settings/files/[id]`, the initial plan used `sql.begin(async (tx) => {...})` for atomic multi-table deletes (reports, processed_files, pending_uploads).

This is a **postgres.js / Pool API** pattern. The Neon HTTP driver (`neon()` from `@neondatabase/serverless`) does NOT support `sql.begin()`. It would fail at runtime.

## Symptom

```typescript
// This compiles but FAILS at runtime — sql.begin() is not a function
await sql.begin(async (tx) => {
  await tx`DELETE FROM reports WHERE ...`;
  await tx`DELETE FROM processed_files WHERE ...`;
  await tx`DELETE FROM pending_uploads WHERE ...`;
});
```

## Root Cause

The project uses `neon()` from `@neondatabase/serverless` (HTTP driver), not `postgres()` from `postgres` (TCP Pool driver). The HTTP driver is stateless — each `sql` tagged template is an independent HTTP request. There is no persistent connection to hold a transaction open.

The Neon HTTP driver supports `sql.transaction([...])` (non-interactive batch) but NOT `sql.begin()` (interactive transaction with a callback).

See: `web/src/lib/db.ts` — exports `sql` from `neon()`.

## Working Solution

Use sequential deletes without transactions. CASCADE from `reports` → `metrics` handles the critical atomic part at the DB level.

```typescript
// 1. Delete report(s) — CASCADE handles metrics automatically
await sql`
  DELETE FROM reports
  WHERE profile_id = ${file.profile_id}
  AND (
    (content_hash IS NOT NULL AND content_hash = ${file.content_hash})
    OR (content_hash IS NULL AND file_name = ${file.file_name})
  )
`;

// 2. Delete processed_files record
await sql`DELETE FROM processed_files WHERE id = ${id}`;

// 3. Clean up pending_uploads (best-effort)
await sql`
  DELETE FROM pending_uploads
  WHERE profile_id = ${file.profile_id}
    AND content_hash = ${file.content_hash}
`;
```

This matches the existing pattern in `/api/cleanup/route.ts`.

## Why Sequential Deletes Are Acceptable

- CASCADE from `reports` → `metrics` is atomic at the DB level (single DELETE triggers cascade)
- If step 2 or 3 fails, the worst case is an orphaned `processed_files` or `pending_uploads` row — harmless bookkeeping
- Errors are caught and reported to Sentry via `reportError()`
- The periodic cleanup job handles orphaned records

## Prevention

- **Rule**: Always use sequential `sql` queries with CASCADE — never `sql.begin()` in this project
- **Code review check**: Search for `sql.begin`, `sql.end`, `pool.connect` in new DB code
- **When writing new multi-table operations**: Check `web/src/lib/db.ts` first — it's `neon()`, not a Pool

## Related Files

- `web/src/lib/db.ts` — Neon driver setup
- `web/src/app/api/cleanup/route.ts` — Sequential delete pattern (reference)
- `web/src/app/api/settings/files/[id]/route.ts` — Fixed implementation
- `web/src/app/api/profiles/[id]/route.ts` — Another multi-step delete route
- [Neon HTTP driver docs](https://neon.com/docs/serverless/serverless-driver)
