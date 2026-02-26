---
status: pending
priority: p2
issue_id: "005"
tags: [code-review, accessibility, i18n]
dependencies: []
---

# Translate hardcoded aria-label in locale-switcher

## Problem Statement

`web/src/components/locale-switcher.tsx` line 25 has a hardcoded English `aria-label="Change language"`. For an i18n feature, this should use a translated key so screen readers get the label in the user's current language.

## Fix

Add a translation key `components.header.changeLanguage` to all locale files and use `useTranslations()`:

```tsx
const t = useTranslations("components.header");
// ...
aria-label={t("changeLanguage")}
```

## Acceptance Criteria

- [ ] aria-label uses translated string
- [ ] Translation key added to tr.json, en.json, es.json
