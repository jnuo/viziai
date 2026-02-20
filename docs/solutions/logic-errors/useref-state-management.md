---
title: "useRef doesn't trigger re-renders — never use ref.current in JSX for UI state"
category: logic-errors
tags: [react, useref, usestate, re-render, disabled-prop, double-click]
module: web/src/app/settings/page.tsx
symptom: "disabled={deletingRef.current} never actually disabled buttons during delete flight"
root_cause: "React refs are mutable containers that bypass the rendering cycle — mutating ref.current does not trigger a re-render"
severity: high
date_discovered: 2026-02-20
date_resolved: 2026-02-20
related_pr: "28"
---

# useRef doesn't trigger re-renders — never use ref.current in JSX for UI state

## Problem

Trash icon buttons on the settings file list stayed clickable during delete flight. The code used `useRef` to track the "deleting" state and passed `disabled={deletingRef.current}` to buttons — but this never actually disabled them.

## Symptom

```tsx
const deletingRef = useRef(false);

async function confirmDelete(id: string) {
  deletingRef.current = true;  // mutates ref — NO re-render
  // ... fetch DELETE ...
  deletingRef.current = false;
}

// In JSX:
<Button disabled={deletingRef.current}>  // reads false forever (initial render value)
```

The button reads `deletingRef.current` at render time. Since mutating a ref doesn't queue a re-render, the component never re-renders with the updated value. The `disabled` prop stays `false`.

## Root Cause

**`useRef`** creates a mutable container (`{ current: value }`). Changing `.current` does NOT notify React. The component function doesn't re-execute, so JSX expressions that read `ref.current` are stale.

**`useState`** stores a value in React's fiber tree. Calling the setter queues a re-render. The component function re-executes and JSX reads the new value.

## Working Solution

Replace `useRef` with `useState`. The state change triggers a re-render, and `disabled={deleting}` reads the correct value.

```tsx
// BEFORE (broken)
const deletingRef = useRef(false);
deletingRef.current = true;
<Button disabled={deletingRef.current}>  // always false

// AFTER (correct)
const [deleting, setDeleting] = useState(false);
setDeleting(true);
<Button disabled={deleting}>  // re-renders with true
```

Full pattern:

```tsx
const [deletingId, setDeletingId] = useState<string | null>(null);
const [deleting, setDeleting] = useState(false);

function requestDelete(id: string) {
  if (deleting) return; // state check prevents switching targets mid-flight
  setDeletingId(id);
}

async function confirmDelete(id: string) {
  if (deleting) return; // state check prevents double-clicks
  setDeleting(true);
  try {
    const res = await fetch(`/api/settings/files/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Silme basarisiz");
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setDeletingId(null);
  } finally {
    setDeleting(false); // triggers re-render, buttons re-enabled
  }
}
```

## Prevention

- **Rule**: Never use `ref.current` in JSX for values that affect rendering (disabled, className, conditional display)
- **Code review check**: Search for `{ref.current}`, `disabled={...Ref.current}`, `className={...Ref.current ? ...}` in JSX
- **When useRef IS correct**: DOM access (`ref.current.focus()`), timer IDs (`timerRef.current = setInterval(...)`), one-time guards in useEffect (`if (initialized.current) return`)

## Correct Pattern Reference

See `web/src/components/tracking-history.tsx` — uses `useState` for all UI state (`editingId`, `deletingId`, `saving`). No refs for UI control.

## Potential Other Occurrences

The Related Docs Finder flagged `web/src/app/dashboard/page.tsx` (line 249) which uses `const hasAutoSelected = useRef(false)` to control conditional auto-selection logic. This may have the same issue — worth investigating.

## Related Files

- `web/src/app/settings/page.tsx` — Fixed implementation
- `web/src/components/tracking-history.tsx` — Reference pattern (correct useState usage)
- `web/src/app/dashboard/page.tsx` — Potential same bug (hasAutoSelected ref)
- `web/src/app/upload/page.tsx` — Correct ref usage (timer IDs, not UI state)
