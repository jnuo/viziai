---
title: "feat: Add file deletion to settings/files page"
type: feat
status: completed
date: 2026-02-20
deepened: 2026-02-20
---

# feat: Add file deletion to settings/files page

## Enhancement Summary

**Deepened on:** 2026-02-20
**Agents used:** TypeScript reviewer, Security sentinel, Performance oracle, Data integrity guardian, Architecture strategist, Pattern recognition, Code simplicity, Frontend race conditions, Best practices researcher

### Key Improvements from Research

1. **CRITICAL fix:** `sql.begin()` doesn't exist on Neon HTTP driver — use sequential deletes (matching existing cleanup route pattern)
2. **Data integrity:** Use `content_hash` for report lookup instead of fragile `file_name` TEXT match, with `file_name` fallback for old records
3. **Simplified scope:** Removed file detail page delete (only on list page), removed unnecessary GET endpoint extension (`access_level` already available client-side)
4. **Race condition guards:** Double-click prevention via ref, hide cancel button during flight, disable other trash icons during delete

## Overview

Allow users to delete uploaded blood test files from the settings page. Deleting a file removes the `processed_files` record, the associated `reports` row (which CASCADEs to `metrics`), and any related `pending_uploads` records. Only users with `owner` or `editor` access can delete.

## Problem Statement

Users currently have no way to remove uploaded files. If a file was uploaded by mistake or contains incorrect data, there is no delete option — only an admin can clean up via SQL.

## Proposed Solution

1. Add a `DELETE` handler to the existing `/api/settings/files/[id]` route
2. Add inline delete confirmation UI to the settings file list (desktop table + mobile cards)
3. Show metric count in the confirmation message (e.g. "14 metrik silinecek. Onayla?")

## Technical Approach

### API: `DELETE /api/settings/files/[id]/route.ts`

Add a `DELETE` export to the existing route file. Follow the pattern from `/api/tracking/[id]/route.ts`.

**Important:** The Neon HTTP driver (`neon()` from `@neondatabase/serverless`) does NOT support `sql.begin()`. Use sequential deletes matching the existing pattern in `/api/cleanup/route.ts`. The CASCADE from `reports` → `metrics` handles the critical atomic part at the DB level.

```typescript
// web/src/app/api/settings/files/[id]/route.ts
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireAuth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // 1. Fetch the processed_file (explicit columns, not SELECT *)
    const files = await sql`
      SELECT id, profile_id, file_name, content_hash
      FROM processed_files WHERE id = ${id}
    `;
    if (files.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const file = files[0];

    // 2. Check access level (owner/editor only)
    const level = await getProfileAccessLevel(userId, file.profile_id);
    if (!level || !["owner", "editor"].includes(level))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 3. Delete report(s) — use content_hash with file_name fallback for old records
    //    CASCADE handles metrics automatically
    await sql`
      DELETE FROM reports
      WHERE profile_id = ${file.profile_id}
      AND (
        (content_hash IS NOT NULL AND content_hash = ${file.content_hash})
        OR (content_hash IS NULL AND file_name = ${file.file_name})
      )
    `;

    // 4. Delete processed_files record
    await sql`DELETE FROM processed_files WHERE id = ${id}`;

    // 5. Clean up pending_uploads (best-effort)
    await sql`
      DELETE FROM pending_uploads
      WHERE profile_id = ${file.profile_id}
        AND content_hash = ${file.content_hash}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    reportError(error, { op: "settings.files.delete", fileId: id });
    return NextResponse.json(
      { error: "Dosya silinirken hata olustu" },
      { status: 500 },
    );
  }
}
```

**Key decisions:**

- **Sequential deletes, no transaction** — matches existing cleanup route pattern. CASCADE from `reports` → `metrics` is atomic at DB level. Partial failure modes are tolerable (orphaned `processed_files` row is harmless).
- **`content_hash` for report lookup** — more reliable than `file_name` TEXT match. Falls back to `file_name` for older records where `reports.content_hash` may be NULL.
- **Deletes ALL matching reports** — not just the first one, preventing orphaned metrics.
- **`reportError()` in catch** — sends to Sentry for observability, matching codebase convention.
- Does not block on active extractions — QStash worker handles missing records gracefully.
- Does not delete `metric_preferences` — harmless orphans, shared across reports.

### UI: Settings file list (`web/src/app/settings/page.tsx`)

Add inline delete confirmation matching the tracking-history pattern, with race condition guards:

- Add `deletingId` state and `deletingRef` (useRef for synchronous double-click guard)
- Add `deleting` boolean state for UI feedback
- Show trash icon button per file row (hidden for viewers via `canEdit` check using existing `accessLevel`)
- On trash click: set `deletingId` (blocked if another delete is in-flight via `deletingRef`)
- Show "N metrik silinecek. Onayla?" / "Iptal" inline
- On confirm: set `deletingRef.current = true`, call `DELETE /api/settings/files/[id]`, remove from local state on success, show success toast
- During flight: show spinner + "Siliniyor...", hide "Iptal" button, disable other rows' trash icons
- On cancel: clear `deletingId` (only before request fires)
- On failure: show error toast, re-enable confirmation
- Both desktop table rows and mobile card views need the delete UI
- Metric count for confirmation message comes from the already-fetched `file.metric_count` — no extra API call needed

```tsx
// Race condition guard pattern
const deletingRef = useRef(false);
const [deletingId, setDeletingId] = useState<string | null>(null);
const [deleting, setDeleting] = useState(false);

function requestDelete(id: string) {
  if (deletingRef.current) return; // block switching targets mid-flight
  setDeletingId(id);
}

async function confirmDelete(id: string) {
  if (deletingRef.current) return; // synchronous double-click guard
  deletingRef.current = true;
  setDeleting(true);
  try {
    const res = await fetch(`/api/settings/files/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Silme basarisiz");
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setDeletingId(null);
    addToast({ message: "Dosya silindi", type: "success" });
  } catch (err) {
    reportError(err, { op: "settings.deleteFile", id });
    addToast({ message: "Dosya silinirken hata olustu", type: "error" });
  } finally {
    deletingRef.current = false;
    setDeleting(false);
  }
}
```

**Confirmation UI states:**

| State              | Onayla enabled?   | Iptal visible? | Other trash icons? |
| ------------------ | ----------------- | -------------- | ------------------ |
| Confirmation shown | Yes               | Yes            | Disabled           |
| DELETE in flight   | No (spinner)      | No             | Disabled           |
| DELETE succeeded   | N/A (row removed) | N/A            | Re-enabled         |
| DELETE failed      | Re-enabled        | Re-shown       | Re-enabled         |

### Files to modify

| File                                           | Change                                               |
| ---------------------------------------------- | ---------------------------------------------------- |
| `web/src/app/api/settings/files/[id]/route.ts` | Add `DELETE` handler                                 |
| `web/src/app/settings/page.tsx`                | Add delete button + inline confirmation to file list |

### Files to reference (patterns)

| File                                      | Pattern                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `web/src/app/api/tracking/[id]/route.ts`  | DELETE handler auth + access level pattern                             |
| `web/src/app/api/cleanup/route.ts`        | Sequential deletes without transaction (same driver)                   |
| `web/src/components/tracking-history.tsx` | Inline delete confirmation UI pattern (`deletingId`, `deleting` state) |
| `web/src/app/settings/page.tsx:179`       | Existing `accessLevel` variable for gating edit actions                |

## Acceptance Criteria

- [x] `DELETE /api/settings/files/[id]` endpoint deletes reports (CASCADE -> metrics), processed_files, and pending_uploads sequentially
- [x] Report lookup uses `content_hash` with `file_name` fallback for old records
- [x] API enforces auth + owner/editor access level check
- [x] API returns 404 for nonexistent files, 403 for viewers
- [x] API has try/catch with `reportError()` for Sentry observability
- [x] Settings file list shows delete button (trash icon) for owner/editor only
- [x] Delete confirmation shows metric count: "N metrik silinecek. Onayla?"
- [x] Double-click prevention via ref guard
- [x] Cancel button hidden and spinner shown during DELETE flight
- [x] Other rows' trash icons disabled during DELETE flight
- [x] Successful deletion removes file from list and shows success toast
- [x] Empty state shown when last file is deleted
- [x] Works on both mobile (card view) and desktop (table view)

## Edge Cases

- **No matching report**: Only `processed_files` and `pending_uploads` are deleted. No error.
- **Active extraction in progress**: Deletion proceeds. QStash worker handles missing records.
- **Viewer access**: Delete button not rendered. API returns 403 as a safety net.
- **Last file deleted**: Empty state ("Henuz yuklenmus dosya yok.") renders automatically.
- **Re-upload after delete**: Allowed — `processed_files` record is gone so duplicate detection won't block it.
- **Double-click**: Ref guard prevents second DELETE request.
- **Navigate away during delete**: DELETE completes server-side; stale UI is acceptable for list page (no unmount issue since settings page stays mounted).
- **Shared report (two files, same sample_date)**: Entire report + all metrics deleted. Acceptable tradeoff — this scenario is near-impossible due to duplicate detection.
- **Idempotent replay**: Second DELETE returns 404 (file already gone) — frontend handles gracefully.

## References

- Tracking delete pattern: `web/src/app/api/tracking/[id]/route.ts`
- Cleanup route (sequential deletes): `web/src/app/api/cleanup/route.ts`
- Inline confirmation UI: `web/src/components/tracking-history.tsx:38-197`
- Settings page access level: `web/src/app/settings/page.tsx:179`
- File list API: `web/src/app/api/settings/files/route.ts`
- File detail API: `web/src/app/api/settings/files/[id]/route.ts`
- Upload confirm (report creation): `web/src/app/api/upload/[id]/confirm/route.ts`
- Neon HTTP driver docs: https://neon.com/docs/serverless/serverless-driver
