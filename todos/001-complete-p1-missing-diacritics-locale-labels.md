---
status: pending
priority: p1
issue_id: "001"
tags: [code-review, i18n, quality]
dependencies: []
---

# Missing diacritics in localeLabels (config.ts)

## Problem Statement

`localeLabels` in `web/src/i18n/config.ts` uses ASCII-only text for Turkish and Spanish labels: `"Turkce"` and `"Espanol"`. These are user-facing strings displayed in the locale dropdown and are missing diacritical marks. The correct native language names are "Turkcee" and "Espanol".

## Findings

- `web/src/i18n/config.ts` lines 6-8: `tr: "Turkce"` should be `tr: "Turkce"`, `es: "Espanol"` should be `es: "Espanol"`
- The Inter font with `latin-ext` subset supports these characters
- Flagged by: TypeScript reviewer, pattern recognition, architecture, simplicity reviewers

## Fix

```typescript
export const localeLabels: Record<Locale, string> = {
  tr: "Turkce", // with cedilla and umlaut
  en: "English",
  es: "Espanol", // with tilde
};
```

## Acceptance Criteria

- [ ] `localeLabels.tr` displays with proper Turkish characters
- [ ] `localeLabels.es` displays with proper Spanish tilde
