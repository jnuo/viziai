---
status: pending
priority: p1
issue_id: "003"
tags: [code-review, race-condition, frontend]
dependencies: []
---

# Restore useRef guard in useLocaleSwitch hook

## Problem Statement

The old locale switching code used a `useRef(false)` guard to prevent concurrent locale switches. The new `useLocaleSwitch` hook replaced it with just an `isPending` check from `useTransition`. The `isPending` value is React state — it only updates after a re-render. Between calling `startTransition` and React re-rendering, the closure still sees the old `isPending === false`, creating a theoretical race window for double-fires.

## Findings

- `web/src/hooks/use-locale-switch.ts` line 14-15: `if (target === locale || isPending) return` — the `isPending` guard has a race window
- The old code had `useRef(false)` which is synchronously mutable and immediately visible
- Flagged by: frontend races reviewer

## Note

In practice, the dropdown UI (Radix DropdownMenu) closes on click, making double-click nearly impossible through normal user interaction. This is a defensive fix.

## Fix

```typescript
export function useLocaleSwitch() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const switching = useRef(false);

  function switchTo(target: Locale) {
    if (target === locale || switching.current) return;
    switching.current = true;
    startTransition(async () => {
      try {
        await setLocale(target);
        router.refresh();
      } finally {
        switching.current = false;
      }
    });
  }

  return { locale, isPending, switchTo };
}
```

## Acceptance Criteria

- [ ] `useRef` guard restored alongside `isPending`
- [ ] `isPending` still exposed for UI spinner/disabled state
- [ ] Ref reset in `finally` block
