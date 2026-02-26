---
status: pending
priority: p3
issue_id: "006"
tags: [code-review, documentation]
dependencies: []
---

# Update stale JSDoc comments in tracking.ts

## Problem Statement

`web/src/lib/tracking.ts` lines 65 and 77 still say `@param locale - "tr" or "en"` but should include `"es"` or reference the `Locale` type.

## Fix

Update JSDoc to `@param locale - Locale code ("tr", "en", "es")` or similar.

## Acceptance Criteria

- [ ] JSDoc comments updated to reflect all supported locales
