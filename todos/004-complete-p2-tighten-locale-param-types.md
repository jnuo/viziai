---
status: pending
priority: p2
issue_id: "004"
tags: [code-review, typescript, type-safety]
dependencies: []
---

# Tighten function signatures to accept Locale instead of string

## Problem Statement

Functions in `date.ts` and `tracking.ts` accept `locale` as a `string` parameter (default `"tr"`), requiring `as Locale` casts at every `bcp47` lookup. There are 8+ instances of `bcp47[locale as Locale]` across the codebase. If an unexpected string is passed, the lookup returns `undefined` silently.

## Files Affected

- `web/src/lib/date.ts` — `formatTR`, `formatDateTR`, `formatDateTimeTR`
- `web/src/lib/tracking.ts` — `formatTrackingDate`, `formatTrackingDateTime`, `formatRelativeDate`

## Fix

Change parameter type from `string` to `Locale`:

```typescript
import type { Locale } from "@/i18n/config";

export function formatTR(dateStr: string, locale: Locale = "tr"): string {
  // bcp47[locale] — no cast needed
}
```

## Acceptance Criteria

- [ ] All date/tracking utility functions accept `Locale` type
- [ ] All `as Locale` casts removed from these files
- [ ] Callers updated if needed (most already pass Locale values)
