---
title: "feat: Add Spanish Language Support"
type: feat
status: completed
date: 2026-02-26
github_issue: "#47"
deepened: 2026-02-26
---

# feat: Add Spanish Language Support

## Enhancement Summary

**Deepened on:** 2026-02-26
**Research agents used:** best-practices-researcher, kieran-typescript-reviewer, pattern-recognition-specialist, security-sentinel, julik-frontend-races-reviewer, code-simplicity-reviewer, architecture-strategist, react-best-practices, Context7 (next-intl docs)

### Key Improvements Over Original Plan

1. Move `bcp47` map and `localeLabels` to `config.ts` (single source of truth, type-safe)
2. Extract shared `useLocaleSwitch()` hook to eliminate duplicated logic and race conditions
3. Use `Record<Locale, string>` instead of `Record<string, string>` for compile-time exhaustiveness
4. Use `hasLocale()` from next-intl for idiomatic type narrowing
5. Add translation key parity check script
6. Add `optimizePackageImports: ["lucide-react"]` to next.config.ts

### New Considerations Discovered

- Hardcoded Turkish string `"rapor"` in `profile-switcher.tsx:140` — will be wrong for Spanish users
- Hardcoded Turkish strings in `utils.ts` `friendlyMetricName` — will show Turkish to Spanish users
- `router.refresh()` races with Radix dropdown close animation — defer refresh
- `useRef` guard is redundant with `isPending` from `useTransition` — remove it
- Spinner inside header dropdown menu items is unreachable UI (menu closes on click)

---

## Overview

Add Spanish (es) as a third locale to ViziAI. The app currently supports Turkish (tr) and English (en) via next-intl 4.8.3 with cookie-based locale detection. Spanish support requires: adding the locale config, creating the translation file, replacing all binary locale toggles/ternaries with N-locale-safe patterns, and updating the locale switcher UI from a binary toggle to a 3-option picker.

## Problem Statement

Onur lives in Barcelona and uploads Spanish lab PDFs. The app already translates Spanish metric names to Turkish during extraction, but the UI itself has no Spanish option. Adding Spanish is the first step toward a truly multilingual app and validates the i18n architecture before global launch.

## Proposed Solution

Minimal, surgical changes across ~10 files. No new dependencies, no URL-based routing changes, no architecture overhaul.

## Implementation Steps

### Step 1: Add `"es"` to locale config + centralize locale metadata

**File:** `web/src/i18n/config.ts`

```ts
export const locales = ["tr", "en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

export const localeLabels: Record<Locale, string> = {
  tr: "Turkce",
  en: "English",
  es: "Espanol",
};

export const bcp47: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-US",
  es: "es-ES",
};
```

#### Research Insights

**Why `Record<Locale, string>` and not `Record<string, string>`:**
TypeScript will error at compile time if a 4th locale is added to the `locales` array without updating `bcp47` and `localeLabels`. This is the whole point of the `as const` type chain — don't break it with loose typing.

**Why `config.ts` and not `date.ts`:**
The BCP47 mapping is a property of the locale, not of date formatting. `date.ts`, `tracking.ts`, and 2 dialog components all consume this mapping. Placing it in `config.ts` creates a single source of truth with a clean dependency graph: `config.ts` → consumed by formatting utilities and UI components.

**Why `es-ES` specifically:**
The bare tag `"es"` works but falls back to implementation-defined defaults. `"es-ES"` gives: day/month/year order (European, matching Barcelona context), period for thousands separator, comma for decimal.

### Step 2: Create `web/messages/es.json`

Copy `en.json` as the base, translate all 379 keys to Spanish. Key decisions:

- Medical terms: Use standard Spanish medical terminology (e.g., "Tension arterial" for blood pressure, "Peso" for weight)
- UI tone: Match the calm, clear brand voice — avoid clinical jargon where plain Spanish works
- Placeholders: Keep `{count}`, `{date}`, `{profileName}` etc. intact exactly as-is
- Format: Same JSON structure, same keys, only values change

#### Research Insights

**Missing keys are silent failures:** If `es.json` is missing a key, `useTranslations` returns the key path as raw text (e.g., `"pages.upload.title"`). Add error handling in `request.ts`:

```ts
return {
  locale,
  messages,
  onError(error) {
    if (error.code === "MISSING_MESSAGE") {
      console.error(error.message);
    }
  },
};
```

**Translation key parity check:** Add `scripts/check-translations.ts` to verify all 3 JSON files have identical key structures. Run in CI or as pre-commit hook. See Step 8.

### Step 3: Replace all binary BCP47 ternaries

Replace all 8 instances of `locale === "tr" ? "tr-TR" : "en-US"` with `bcp47[locale as Locale]`:

| File                                               | Line | Current                               | After                     |
| -------------------------------------------------- | ---- | ------------------------------------- | ------------------------- |
| `web/src/lib/date.ts`                              | 36   | `locale === "tr" ? "tr-TR" : "en-US"` | `bcp47[locale as Locale]` |
| `web/src/lib/date.ts`                              | 50   | `locale === "tr" ? "tr-TR" : "en-US"` | `bcp47[locale as Locale]` |
| `web/src/lib/date.ts`                              | 85   | `locale === "tr" ? "tr-TR" : "en-US"` | `bcp47[locale as Locale]` |
| `web/src/lib/tracking.ts`                          | 66   | `locale === "tr" ? "tr-TR" : "en-US"` | `bcp47[locale as Locale]` |
| `web/src/lib/tracking.ts`                          | 78   | `locale === "tr" ? "tr-TR" : "en-US"` | `bcp47[locale as Locale]` |
| `web/src/lib/tracking.ts`                          | 109  | `locale === "tr" ? "tr-TR" : "en-US"` | `bcp47[locale as Locale]` |
| `web/src/components/add-blood-pressure-dialog.tsx` | 229  | `locale === "tr" ? "tr-TR" : "en-US"` | `bcp47[locale as Locale]` |
| `web/src/components/add-weight-dialog.tsx`         | 200  | `locale === "tr" ? "tr-TR" : "en-US"` | `bcp47[locale as Locale]` |

Import `bcp47` from `@/i18n/config` in all 4 files.

#### Research Insights

**Why not a `toBCP47()` function?** A `Record<Locale, string>` constant with direct lookup is simpler — the type system guarantees exhaustiveness, so no fallback is needed. A function adds indirection for a static map. If callers receive `locale` as `string` (e.g., from `useLocale()`), use `bcp47[locale as Locale]`.

**Type the `locale` parameters:** The date/tracking utility functions currently accept `locale = "tr"` (inferred as `string`). Optionally tighten to `locale: Locale = "tr"` for stronger type safety. Not blocking but recommended.

### Step 4: Extract shared `useLocaleSwitch()` hook

**New file:** `web/src/hooks/use-locale-switch.ts`

```ts
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { setLocale } from "@/app/actions/locale";
import type { Locale } from "@/i18n/config";

export function useLocaleSwitch() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(target: Locale) {
    if (target === locale || isPending) return;
    startTransition(async () => {
      await setLocale(target);
      router.refresh();
    });
  }

  return { locale, isPending, switchTo };
}
```

#### Research Insights

**Why extract this hook?**
Both `locale-switcher.tsx` (lines 13-29) and `header.tsx` (lines 70-86) have identical copy-pasted switching logic with independent `useRef` guards and `useTransition` hooks. With 3 locales, this duplication breeds bugs — the two guards are independent locks that can't prevent simultaneous switches.

**Remove `useRef` guard:**
The `isPending` state from `useTransition` already prevents double-clicks (the button/items are disabled while pending). The `useRef(false)` guard is redundant. Per project memory: "Never use `disabled={ref.current}` — refs don't trigger re-renders." Since we use `disabled={isPending}`, the ref adds complexity for zero benefit.

**`router.refresh()` timing:**
In Next.js 15, `cookies().set()` inside a server action may already trigger revalidation. Test whether `router.refresh()` is actually needed. If not, remove it to eliminate a redundant full-tree re-render. Alternative: use `revalidatePath("/", "layout")` inside the `setLocale` server action instead.

### Step 5: Rewrite `locale-switcher.tsx` as dropdown

**File:** `web/src/components/locale-switcher.tsx`

```tsx
"use client";

import { Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Locale, locales, localeLabels } from "@/i18n/config";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";

export function LocaleSwitcher() {
  const { locale, isPending, switchTo } = useLocaleSwitch();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Change language"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span className="text-xs font-medium">{locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => switchTo(l)}
            disabled={l === locale}
            className="cursor-pointer"
          >
            {localeLabels[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### Research Insights

**DropdownMenu is the right pattern:** The codebase already uses `DropdownMenu` in `header.tsx` (user menu, "+ Add" menu) and `profile-switcher.tsx`. Using the same component maintains visual consistency with zero additional bundle weight.

**Accessibility:** Radix DropdownMenu provides full keyboard navigation out of the box (Enter/Space opens, Arrow keys navigate, Escape closes). The `aria-label="Change language"` on the trigger is language-agnostic. Language names are in their native script (`Turkce`, `English`, `Espanol`) — critical because a Spanish-only user can't identify "Spanish" or "Ispanyolca".

**No flags:** Globe icon (already used) is correct. Flags represent countries, not languages.

### Step 6: Update `header.tsx` locale switching

**File:** `web/src/components/header.tsx`

Replace the independent locale switching logic with the shared hook and N-locale pattern:

1. **Remove:** `const nextLocale`, `handleLocaleSwitch`, `localeSwitching` ref, `isLocalePending`/`startLocaleTransition`
2. **Add:** `import { useLocaleSwitch } from "@/hooks/use-locale-switch"` and `import { locales, localeLabels } from "@/i18n/config"`
3. **Replace** the single locale `DropdownMenuItem` (lines 246-257) with:

```tsx
{
  locales
    .filter((l) => l !== locale)
    .map((l) => (
      <DropdownMenuItem
        key={l}
        onClick={() => switchTo(l)}
        className="cursor-pointer"
      >
        <Globe className="h-4 w-4" />
        {localeLabels[l]}
      </DropdownMenuItem>
    ));
}
```

#### Research Insights

**No spinner per menu item:** The dropdown closes immediately on click, so the user never sees a spinner on the menu items. The spinner is only useful on the standalone `LocaleSwitcher` trigger button where it stays visible. Drop the `isLocalePending` ternary from the mapped items.

**`router.refresh()` vs Radix close animation:** When `router.refresh()` fires while the dropdown close animation is in progress, React replaces the DOM mid-animation, causing either a visual snap or ghost overlay. The shared hook mitigates this because the dropdown closes on item click before the refresh completes. If visual glitches occur during testing, consider deferring `router.refresh()` using `onOpenChange`.

### Step 7: Update `request.ts` with `hasLocale()`

**File:** `web/src/i18n/request.ts`

```ts
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { cookies } from "next/headers";
import { locales, defaultLocale } from "./config";

export default getRequestConfig(async () => {
  const store = await cookies();
  const raw = store.get("locale")?.value;
  const locale = hasLocale(locales, raw) ? raw : defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return { locale, messages };
});
```

#### Research Insights

`hasLocale()` was added in next-intl 4.0 specifically for narrowing string-typed locales. It replaces the manual `locales.includes(raw as Locale) ? (raw as Locale) : defaultLocale` pattern and narrows the type automatically without casting.

### Step 8: Add translation key parity check

**New file:** `scripts/check-translations.ts`

```ts
import fs from "fs";
import path from "path";

const MESSAGES_DIR = path.join(__dirname, "../web/messages");

function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, val]) => {
    const p = prefix ? `${prefix}.${key}` : key;
    return typeof val === "object" && val !== null
      ? getKeys(val as Record<string, unknown>, p)
      : [p];
  });
}

const files = fs.readdirSync(MESSAGES_DIR).filter((f) => f.endsWith(".json"));
const all = files.map((f) => ({
  locale: f.replace(".json", ""),
  keys: new Set(
    getKeys(JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, f), "utf-8"))),
  ),
}));

const source = all.find((a) => a.locale === "tr")!;
let errors = 0;

for (const other of all.filter((a) => a.locale !== "tr")) {
  for (const key of source.keys) {
    if (!other.keys.has(key)) {
      console.error(`MISSING in ${other.locale}.json: ${key}`);
      errors++;
    }
  }
  for (const key of other.keys) {
    if (!source.keys.has(key)) {
      console.warn(`EXTRA in ${other.locale}.json (not in tr): ${key}`);
    }
  }
}

process.exit(errors > 0 ? 1 : 0);
```

Run: `npx tsx scripts/check-translations.ts`

### Step 9: Verify — no changes needed

- `web/src/app/actions/locale.ts` — validates against `locales` array, accepts `"es"` automatically
- `web/src/app/layout.tsx` — `<html lang={locale}>` outputs `"es"` correctly
- `web/src/middleware.ts` — handles auth only, no locale routing
- Inter font with `["latin", "latin-ext"]` subsets covers Spanish characters
- Extraction prompt in `worker/route.ts` — hardcoded Turkish, already handles Spanish PDFs, fully decoupled from UI locale

## Acceptance Criteria

- [x] `es` appears in locale config and TypeScript `Locale` type
- [x] `web/messages/es.json` exists with all keys matching `tr.json` structure
- [x] `scripts/check-translations.ts` passes with 0 errors
- [x] Locale switcher shows 3 options (TR/EN/ES) in both header dropdown and standalone component
- [ ] Setting locale to `es` persists in cookie and survives page refresh
- [x] All date formatting uses Spanish locale (`es-ES`) when locale is `es`
- [x] No remaining `locale === "tr" ? ... : ...` binary ternaries in source code
- [ ] Landing page, dashboard, upload flow, settings, tracking all render in Spanish
- [x] Extraction prompt unchanged — still outputs Turkish metric names regardless of UI locale
- [x] `useLocaleSwitch` hook used in both locale-switcher.tsx and header.tsx (no duplicated logic)

## Files to Modify

| File                                               | Change                                                     |
| -------------------------------------------------- | ---------------------------------------------------------- |
| `web/src/i18n/config.ts`                           | Add `"es"`, `localeLabels`, `bcp47` records                |
| `web/messages/es.json`                             | **New file** — Spanish translations                        |
| `web/src/hooks/use-locale-switch.ts`               | **New file** — shared locale switching hook                |
| `web/src/i18n/request.ts`                          | Use `hasLocale()` from next-intl                           |
| `web/src/lib/date.ts`                              | Import `bcp47`, replace 3 ternaries                        |
| `web/src/lib/tracking.ts`                          | Import `bcp47`, replace 3 ternaries                        |
| `web/src/components/locale-switcher.tsx`           | Rewrite as dropdown using shared hook                      |
| `web/src/components/header.tsx`                    | Use shared hook, replace binary toggle, remove duplication |
| `web/src/components/add-blood-pressure-dialog.tsx` | Import `bcp47`, replace 1 ternary                          |
| `web/src/components/add-weight-dialog.tsx`         | Import `bcp47`, replace 1 ternary                          |
| `scripts/check-translations.ts`                    | **New file** — translation key parity check                |

## Known Pre-existing i18n Gaps (Out of Scope but Documented)

These exist today and will be visible to Spanish users. Fix separately:

| Gap                  | File                                          | Issue                                                            |
| -------------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| Hardcoded `"rapor"`  | `web/src/components/profile-switcher.tsx:140` | Turkish string, not translated                                   |
| `friendlyMetricName` | `web/src/lib/utils.ts:12-15`                  | Returns Turkish-only friendly names                              |
| `global-error.tsx`   | `web/src/app/global-error.tsx`                | Hardcoded English (can't use `useTranslations` outside provider) |
| Static metadata      | `web/src/app/layout.tsx:23-24`                | English-only meta description                                    |

## Out of Scope

- Extraction prompt changes (stays Turkish regardless of UI locale)
- URL-based locale routing (stays cookie-based — correct for authenticated app)
- Metric name translation to Spanish (metrics are always in Turkish)
- Browser language auto-detection (can be added later)
- Function renaming (`formatTR` → `formatShortDate` etc.) — cosmetic, do separately

## Security Assessment

**Overall risk: LOW.** All locale validation is sound:

- Double allowlist validation (write-side in `setLocale`, read-side in `request.ts`)
- Cookie: `httpOnly`, `secure`, `sameSite: "lax"`
- Dynamic import gated behind allowlist — no path traversal possible
- `Intl.DateTimeFormat` handles arbitrary locale strings gracefully
- React auto-escaping prevents XSS from translation strings
- `LOCALE_LABELS` are developer-controlled constants, not user input

## References

- GitHub Issue: #47
- Existing bilingual plan: `docs/plans/2026-02-24-feat-bilingual-localization-en-tr-plan.md`
- next-intl docs: https://next-intl.dev
- next-intl 4.0 `hasLocale()`: https://next-intl.dev/blog/next-intl-4-0
- next-intl TypeScript: https://next-intl.dev/docs/workflows/typescript
- Current i18n config: `web/src/i18n/config.ts`
