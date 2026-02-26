---
title: "feat: Bilingual Localization (Turkish + English)"
type: feat
status: completed
date: 2026-02-24
branch: feat/i18n-bilingual
deepened: 2026-02-24
---

# feat: Bilingual Localization (Turkish + English)

## Enhancement Summary

**Deepened on:** 2026-02-24
**Review agents used:** TypeScript Reviewer, Performance Oracle, Security Sentinel, Architecture Strategist, Frontend Races Reviewer, Code Simplicity Reviewer, Pattern Recognition Specialist, React Best Practices Reviewer, Web Design Guidelines Reviewer

### Key Improvements from Deepening

1. **Simplified date utility approach** — keep existing functions with locale parameter instead of rewriting 30+ call sites to `useFormatter()`
2. **Security hardened** — strict allowlist validation in server action, `httpOnly` cookie, no `t.raw()`, bounded header parsing
3. **Race condition mitigation** — AbortController in fetch effects, ref guard on locale toggle, single refresh mechanism
4. **Removed YAGNI** — dropped Accept-Language detection, localStorage backup, GA locale tracking, `generateMetadata()` conversion
5. **Explicit provider nesting** — `NextIntlClientProvider` outermost, before `Providers`/`ThemeProvider`
6. **Language switcher UX designed** — Globe icon + code, always visible (never in dropdown), specific placement for auth/unauth
7. **TypeScript type safety** — `Locale` type in AppConfig, `types.d.ts` (not `.ts`), string literal union for BP status keys
8. **JSON key parity test** — automated test ensures `tr.json` and `en.json` stay in sync
9. **ACCESS_LABELS consolidation** — 4 duplicate definitions unified into `common.roles.*` translation keys

### Simplifications Applied

- Dropped Accept-Language header detection (YAGNI — ~5 family users, toggle is enough)
- Dropped localStorage backup (cookie is the single source of truth)
- Dropped `generateMetadata()` conversion (private app, SEO irrelevant)
- Dropped GA locale tracking (5 known users)
- Collapsed 7 phases to 3 (Setup / Extract / Review)
- Reduced 10 namespaces to 4 (`common`, `pages`, `components`, `tracking`)
- Keep existing date utilities with locale param instead of replacing with `useFormatter()`

## Overview

Add full bilingual support (Turkish + English) to ViziAI using `next-intl` 4.x with cookie-based locale detection (no URL prefixes). All ~200 hardcoded Turkish strings across ~25 files will be extracted into structured locale files. A language switcher (TR/EN) in the header lets users switch instantly. Default language remains Turkish.

**Key addition:** An English-speaking end-user persona (via the frontend-design agent) will iteratively review every screen after implementation. If any label sounds unnatural, unclear, or wrong for a global health monitoring product, it gets fixed and re-reviewed until the persona approves. Same for label quality — iterate until all issues are confirmed resolved.

## Problem Statement

Every label, button, heading, error message, placeholder, status text, aria-label, and toast notification is hardcoded in Turkish. English-speaking users (Turkish diaspora in Western Europe, international users) cannot use the app. The `<html lang="tr">` attribute causes screen readers to mispronounce English text.

## Proposed Solution

### Architecture: next-intl 4.x without i18n routing

- **No URL prefixes** (`/en/dashboard`, `/tr/dashboard`) — overkill for 2 languages
- **Cookie-based locale** — `httpOnly` cookie read by `i18n/request.ts` on the server
- **`NextIntlClientProvider`** wraps the app in root layout as outermost client provider (zero-prop in v4, auto-inherits)
- **`useTranslations()`** hook in all client components (every page is `"use client"`)
- **Existing date utilities** kept with locale parameter (not replaced by `useFormatter()` — avoids rewriting 30+ call sites)
- **Server action** `setLocale` sets cookie, client calls `router.refresh()` for soft navigation
- **ICU message format** for interpolation, plurals, and select (word-order-safe)

### File Structure

```
web/
├── messages/
│   ├── tr.json                # Turkish translations (source of truth for types)
│   └── en.json                # English translations
├── next.config.ts             # Add createNextIntlPlugin wrapper (INNER, before Sentry)
└── src/
    ├── i18n/
    │   ├── config.ts          # NEW: Shared locale constants and types
    │   ├── request.ts         # Cookie-based locale detection
    │   └── types.d.ts         # TypeScript AppConfig augmentation (.d.ts, not .ts)
    ├── app/
    │   ├── layout.tsx         # Wrap with NextIntlClientProvider (outermost), dynamic lang
    │   └── actions/
    │       └── locale.ts      # Server action: setLocale (strict validation + httpOnly cookie)
    ├── components/
    │   └── locale-switcher.tsx # Globe icon + TR/EN toggle with ref guard
    └── __tests__/
        └── i18n-keys.test.ts  # Automated key parity check (tr.json === en.json keys)
```

## Technical Approach

### Phase 1: Infrastructure Setup

**Files to create/modify:**

1. **Install next-intl** — `npm install next-intl`

2. **`web/src/i18n/config.ts`** — Shared locale constants (single source of truth):

   ```typescript
   export const locales = ["tr", "en"] as const;
   export type Locale = (typeof locales)[number]; // "tr" | "en"
   export const defaultLocale: Locale = "tr";
   ```

3. **`web/next.config.ts`** — Add `createNextIntlPlugin()` as INNER wrapper (Sentry wraps outer):

   ```typescript
   import createNextIntlPlugin from "next-intl/plugin";
   const withNextIntl = createNextIntlPlugin();
   // withNextIntl wraps FIRST, then Sentry wraps the result
   export default withSentryConfig(withNextIntl(nextConfig), { ... });
   ```

   **Composition order matters.** `createNextIntlPlugin` modifies webpack module resolution; Sentry adds source maps. next-intl must be the inner wrapper.

   **Verify Turbopack compatibility** — the project uses `--turbopack` for both dev and build. Test that `createNextIntlPlugin()` works with Turbopack before proceeding.

4. **`web/src/i18n/request.ts`** — Cookie-based locale config:
   - Read `locale` cookie via `cookies()` from `next/headers`
   - Validate against `locales` array from `config.ts`, default to `"tr"`
   - **No Accept-Language detection** (YAGNI — ~5 family users, toggle is enough)
   - Import messages dynamically: `await import(\`../../messages/${locale}.json\`)`
   - Set `timeZone: "Europe/Istanbul"`
   - Define named date/number formats for `useFormatter()`

5. **`web/src/i18n/types.d.ts`** — TypeScript augmentation (must be `.d.ts`, not `.ts`, to prevent accidental module conversion):

   ```typescript
   declare module "next-intl" {
     interface AppConfig {
       Locale: import("./config").Locale; // "tr" | "en" — type-safe useLocale()
       Messages: typeof import("../../messages/tr.json");
     }
   }
   ```

   **Both `Locale` and `Messages` must be augmented.** Without `Locale`, `useLocale()` returns `string` and loses type safety everywhere.

6. **`web/src/app/layout.tsx`** — Changes:
   - Import `NextIntlClientProvider` from `next-intl`
   - Import `getLocale` from `next-intl/server`
   - Make function `async`, call `const locale = await getLocale()`
   - Set `<html lang={locale}>` (dynamic, resolves FOWL)
   - **Provider nesting order** (outermost to innermost):

     ```tsx
     <Providers>
       {" "}
       {/* SessionProvider — auth is independent */}
       <NextIntlClientProvider>
         {" "}
         {/* OUTERMOST client provider — everything below gets translations */}
         <ThemeProvider>
           <ToastProvider>
             <NotificationChecker />
             {children}
           </ToastProvider>
         </ThemeProvider>
       </NextIntlClientProvider>
     </Providers>
     ```

   - Keep static `metadata` export (no `generateMetadata()` — private app, SEO is irrelevant)

7. **`web/src/app/actions/locale.ts`** — Server action with strict validation:

   ```typescript
   "use server";
   import { cookies } from "next/headers";
   import { type Locale, locales } from "@/i18n/config";

   export async function setLocale(locale: Locale): Promise<void> {
     // Server actions are public HTTP endpoints — validate even with types
     if (!locales.includes(locale)) return;

     const store = await cookies();
     store.set("locale", locale, {
       httpOnly: true, // Server-only; client reads via useLocale()
       secure: process.env.NODE_ENV === "production",
       sameSite: "lax",
       maxAge: 60 * 60 * 24 * 365,
       path: "/",
     });
     // NO revalidatePath here — client calls router.refresh() which is sufficient
   }
   ```

   **No `revalidatePath`** — `router.refresh()` from the client already triggers a server re-render. Using both causes a double-refresh race condition.

8. **`web/src/components/locale-switcher.tsx`** — Globe icon + language code toggle:

   ```tsx
   "use client";
   import { useRef, useTransition } from "react";
   import { useRouter } from "next/navigation";
   import { useLocale } from "next-intl";
   import { Globe, Loader2 } from "lucide-react";
   import { setLocale } from "@/app/actions/locale";
   import type { Locale } from "@/i18n/config";

   export function LocaleSwitcher() {
     const locale = useLocale();
     const router = useRouter();
     const [isPending, startTransition] = useTransition();
     const switching = useRef(false); // Ref guard against rapid clicks

     const nextLocale: Locale = locale === "tr" ? "en" : "tr";

     function handleSwitch() {
       if (switching.current) return;
       switching.current = true;
       startTransition(async () => {
         try {
           await setLocale(nextLocale);
           router.refresh();
         } finally {
           switching.current = false;
         }
       });
     }

     return (
       <button
         onClick={handleSwitch}
         disabled={isPending}
         aria-label={locale === "tr" ? "Switch to English" : "Turkceye gec"}
       >
         {isPending ? <Loader2 className="animate-spin" /> : <Globe />}
         <span lang={nextLocale}>{nextLocale.toUpperCase()}</span>
       </button>
     );
   }
   ```

   **Placement:**
   - **Authenticated users:** Leftmost in header right-side group, before "Tahliller" nav link
   - **Unauthenticated users:** Immediately left of "Giris Yap" / "Sign In" button
   - **Login page:** Standalone in top-right (login page has its own layout, not shared header)
   - **Always visible** — never collapsed into a dropdown, even on mobile
   - **Style:** `variant="ghost"` with `text-muted-foreground` — understated, matches brand

9. **`web/messages/tr.json`** — Extract ALL Turkish strings, organized by 4 namespaces
10. **`web/messages/en.json`** — English translations for every key

11. **`web/src/__tests__/i18n-keys.test.ts`** — Automated key parity test:

    ```typescript
    import tr from "../../messages/tr.json";
    import en from "../../messages/en.json";

    function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
      return Object.entries(obj).flatMap(([key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        return typeof value === "object" && value !== null
          ? getKeys(value as Record<string, unknown>, path)
          : [path];
      });
    }

    test("tr.json and en.json have identical key sets", () => {
      expect(getKeys(en).sort()).toEqual(getKeys(tr).sort());
    });
    ```

### Phase 2: Extract All Strings (single pass through all files)

Work through all files in one pass. For each file: find hardcoded Turkish text, add keys to both JSON files, replace with `t()` calls.

**Date utility refactoring (keep functions, add locale param):**

```typescript
// web/src/lib/date.ts — just add locale parameter, rename to drop "TR"
export function formatShortDate(dateStr: string, locale: string = "tr"): string {
  // ... existing logic, swap "tr-TR" for locale === "tr" ? "tr-TR" : "en-US"
}
export function formatDate(dateString: string | null, locale: string = "tr"): string { ... }
export function formatDateTime(dateString: string | null, locale: string = "tr"): string { ... }
```

Call sites get locale from `useLocale()` hook and pass it down. `parseToISO()` and `compareDateAsc()` stay unchanged (locale-independent).

**`getBPStatus()` refactoring (return key, not label):**

```typescript
// web/src/lib/tracking.ts
export const BP_STATUS_KEYS = ["low", "high", "highNormal", "normal"] as const;
export type BPStatusKey = (typeof BP_STATUS_KEYS)[number];

export type BPStatus = {
  key: BPStatusKey; // NOT label: string
  color: string;
  bg: string;
  borderColor: string;
};
```

Component maps key to label: `t(\`tracking.bpStatus.${status.key}\`)`. The string literal union type ensures compile-time safety.

**`friendlyMetricName()` refactoring:**

Return a translation key instead of a Turkish string. Create a `useLocalizedMetricName()` hook that wraps the mapping logic + `useTranslations()` for use across the 7 call sites in `dashboard/page.tsx` and `metric-chart.tsx`.

**ACCESS_LABELS consolidation:**

The 4 duplicate `ACCESS_LABELS` definitions (in `notification-checker.tsx`, `settings/access/page.tsx`, `invite/[token]/page.tsx`, `profile-switcher.tsx`) are replaced by `common.roles.owner`, `common.roles.editor`, `common.roles.viewer` translation keys. This also fixes the existing case inconsistency (lowercase "sahip" vs. title case "Sahip").

**`formatRelativeDate()` in tracking.ts:**

Keep the bucketing logic (< 1 hour, < 24 hours, < 48 hours) but replace Turkish strings ("Az once", "saat once", "Dun") with translation keys. Pass locale to `Intl.RelativeTimeFormat` for the numeric parts.

**Fetch effects — AbortController for stale-locale protection:**

In `dashboard/page.tsx` and other pages with `useEffect` fetches, add `AbortController` to prevent stale-locale toasts:

```typescript
useEffect(() => {
  const controller = new AbortController();
  async function load() {
    try {
      const res = await fetch(url, { signal: controller.signal });
      // ...
    } catch (e) {
      if (controller.signal.aborted) return; // locale switched, discard
      addToast({ message: t("errors.loadFailed"), type: "error" });
    }
  }
  load();
  return () => controller.abort();
}, [activeProfileId, ...]);
```

**Files to modify (all pages and components with hardcoded text):**

| File                                       | Key Changes                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `components/header.tsx`                    | Nav labels, menu items, theme toggle, logout, aria-labels, add `<LocaleSwitcher />`                     |
| `components/empty-state.tsx`               | Title, description, CTA                                                                                 |
| `components/profile-switcher.tsx`          | Fallback text, access badges (use `common.roles.*`)                                                     |
| `components/notification-checker.tsx`      | ICU message template, remove duplicate ACCESS_LABELS                                                    |
| `app/page.tsx`                             | Landing hero, features, CTAs, footer. Add footer language link.                                         |
| `app/login/page.tsx`                       | Title, button, errors, legal text. Add standalone locale switcher.                                      |
| `app/dashboard/page.tsx`                   | Tabs, status flags, search, sort, dates, tracking names, toasts, AbortController                        |
| `components/metric-chart.tsx`              | Labels, tooltips, tick formatters (pass locale from `useLocale()`)                                      |
| `lib/tracking.ts`                          | `getBPStatus()` returns key, date functions accept locale param                                         |
| `lib/date.ts`                              | Rename `formatTR` → `formatShortDate`, add locale param. Keep `parseToISO`, `compareDateAsc` unchanged. |
| `lib/utils.ts`                             | `friendlyMetricName()` returns translation key                                                          |
| `app/upload/page.tsx`                      | Form labels, placeholders, extraction status, review table, errors                                      |
| `components/extraction-loading.tsx`        | 6 messages → `upload.extraction.step1` through `step6` keys                                             |
| `app/settings/page.tsx`                    | Tab display labels, file list headers, delete confirmation, toasts                                      |
| `app/settings/files/[id]/page.tsx`         | File detail headers, edit labels, metric table                                                          |
| `components/tracking-history.tsx`          | Weight/BP table headers, edit/delete, validation, sr-only text                                          |
| `components/add-blood-pressure-dialog.tsx` | Form labels, validation, "already exists" warning, toasts                                               |
| `components/add-weight-dialog.tsx`         | Form labels, validation, "already exists" warning, toasts                                               |
| `app/settings/access/page.tsx`             | Access labels (use `common.roles.*`), invite button                                                     |
| `components/invite-modal.tsx`              | Form labels, success, WhatsApp share text                                                               |
| `app/invite/[token]/page.tsx`              | Status messages (pending, claimed, revoked, expired, not_found)                                         |
| `app/onboarding/page.tsx`                  | Welcome step, create profile step, upload prompt                                                        |
| `web/src/__tests__/lib/date.test.ts`       | Update tests for renamed functions (drop "TR" suffix)                                                   |

### Phase 3: Review (Iterative — loop until approved)

#### Step A: English End-User Persona Review

**This is the quality gate. Nothing ships without persona approval.**

1. **Switch app to English locale**
2. **Launch frontend-design agent as an English-speaking end-user persona** who:
   - Is a health-conscious person monitoring blood test results, weight, and blood pressure
   - Expects clear, professional, calm medical terminology
   - Checks every screen: landing, login, onboarding, dashboard, upload, settings, file detail, access management
   - Evaluates: label clarity, medical terminology accuracy, button text consistency, error message helpfulness, placeholder guidance, accessibility labels
3. **Agent reports issues** — unclear labels, awkward phrasing, inconsistent terminology, missing translations
4. **Fix all reported issues** in `en.json` and any component code
5. **Re-run the persona review** on fixed screens
6. **Repeat until zero issues** — the agent must explicitly confirm "all labels approved"

**Review checklist for the persona:**

- [ ] Landing page reads naturally for a global health product
- [ ] Dashboard metric labels are clear (Weight, Blood Pressure, not jargon)
- [ ] Status indicators (Normal, High, Low) are universally understood
- [ ] Date formats are appropriate (Jan 15, 2026 not 15 Oca 2026)
- [ ] Error messages are helpful and actionable in English
- [ ] Empty states guide the user clearly
- [ ] Accessibility labels make sense when read aloud by a screen reader
- [ ] Legal text is comprehensible
- [ ] Upload flow terminology is clear (especially extraction status messages)
- [ ] Blood pressure and weight tracking labels use proper medical English
- [ ] No leftover Turkish text anywhere
- [ ] Language switcher is discoverable on the landing page for a non-Turkish speaker
- [ ] Text expansion/contraction doesn't break layouts (Turkish is typically 10-30% longer)

#### Step B: Label Quality Review

1. **Run the i18n key parity test** — `npx jest i18n-keys.test.ts`
2. **Check interpolation variables** — same `{variables}` in both files
3. **Check plural forms** — Turkish and English have different plural rules
4. **Verify medical terminology** — "Systolic" not "Sistolic", consistent "Blood Pressure" everywhere
5. **Verify terminology consistency** — same term used everywhere (not "BP" in some places, "Blood Pressure" in others)
6. **Fix issues and re-review until confirmed**

#### Step C: Build and Smoke Test

1. `npm run build` — verify no TypeScript errors, no missing key warnings
2. Check bundle size impact — expected ~6-9 KB increase to shared chunk (3-5% increase on 176 KB baseline)
3. Test locale switch on each page — verify <500ms, no FOWL, no layout shifts
4. Test opening a dialog, switching locale — dialog stays open with updated text
5. Test rapid toggling — verify button disables correctly (ref guard + `isPending`)

## Security Considerations

| Finding                                 | Severity | Mitigation                                                                            |
| --------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| Server action accepts unvalidated input | Medium   | Strict allowlist validation before writing cookie                                     |
| Cookie locale could be tampered         | Low      | `httpOnly: true` — client reads via `useLocale()` context, not cookie directly        |
| Dynamic import path traversal           | Low      | Allowlist validation in `request.ts` prevents non-`tr`/`en` values reaching import    |
| ICU interpolation injection             | Low      | `useTranslations()` returns React-escaped strings by default. **Never use `t.raw()`** |
| CSRF on server action                   | Low      | Handled by Next.js built-in server action CSRF protection                             |

## Race Condition Mitigations

| Issue                                                | Risk   | Fix                                                                                      |
| ---------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| Stale-locale toasts from in-flight fetches           | High   | AbortController in all `useEffect` fetch handlers                                        |
| Rapid locale toggles causing cookie race             | High   | `switching` ref guard + `disabled={isPending}` on button                                 |
| Two sources of truth (cookie vs localStorage)        | Medium | **Removed** — cookie is the only storage. No localStorage.                               |
| `revalidatePath` + `router.refresh()` double-refresh | Medium | **Removed** — only `router.refresh()` from client. No `revalidatePath` in server action. |
| `useMemo` stale locale after switch                  | Medium | Include locale/formatter in dependency arrays for all memoized date formatting           |
| Toasts created pre-switch remain in old locale       | Low    | Accepted behavior — they auto-dismiss in 5 seconds                                       |

## Key Decisions

| Decision                   | Choice                                                  | Rationale                                                                   |
| -------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------- |
| i18n library               | next-intl 4.x                                           | Best Next.js App Router support, auto-inheriting provider, ICU format       |
| Locale detection           | Cookie-based, no URL prefixes                           | Simplest for 2 languages, preserves existing URLs                           |
| Default locale             | Turkish                                                 | Existing users shouldn't see a sudden change                                |
| Cookie flags               | `httpOnly: true`, `secure` in prod, `sameSite: lax`     | Security best practice — client reads from `useLocale()` context            |
| FOWL prevention            | Server reads cookie in `i18n/request.ts`                | Layout is a server component — locale flows to `<html lang>` before paint   |
| Date formatting            | Keep existing utilities + locale parameter              | Avoids rewriting 30+ call sites. Rename `formatTR` → `formatShortDate` etc. |
| Number formatting          | Keep period for decimals                                | Medical convention, both locales                                            |
| Tab URL params             | Keep Turkish internally (`?tab=tahliller`)              | Internal identifiers, only display labels change                            |
| Metric names from DB       | NOT localized                                           | Come from Turkish lab PDFs, medical terms often international               |
| Tracking metric names      | Localized                                               | "Kilo"→"Weight", "Tansiyon"→"Blood Pressure" are synthetic UI labels        |
| API errors                 | Stay English, map on client                             | API doesn't know user locale                                                |
| `getBPStatus()`            | Return `BPStatusKey` literal union, not string          | Compile-time safe translation key lookup                                    |
| Accept-Language            | **Removed** (YAGNI)                                     | ~5 family users, toggle is enough                                           |
| `generateMetadata()`       | **Removed** (YAGNI)                                     | Private app, SEO irrelevant. Keep static metadata.                          |
| localStorage backup        | **Removed**                                             | Cookie is the single source of truth. Two sources = zero sources.           |
| GA locale tracking         | **Removed** (YAGNI)                                     | 5 known users, no analytics value                                           |
| Namespaces                 | 4 (`common`, `pages`, `components`, `tracking`)         | Simpler than 10. Split later if any grows past ~80 keys.                    |
| next.config.ts composition | `withSentryConfig(withNextIntl(nextConfig), ...)`       | next-intl inner (webpack), Sentry outer (sourcemaps)                        |
| Provider nesting           | `NextIntlClientProvider` outermost (inside `Providers`) | Everything below gets translations, including toast and notifications       |
| Refresh mechanism          | `router.refresh()` only (no `revalidatePath`)           | Single mechanism avoids double-refresh race                                 |
| TypeScript augmentation    | `.d.ts` file with both `Locale` and `Messages`          | Prevents module conversion, cascades type safety                            |

## Translation Key Naming Convention

```
{namespace}.{section}.{element}
```

**Namespaces:** `common`, `pages`, `components`, `tracking`

**Rules:**

1. `common.*` for strings in 2+ places (actions, status, roles, errors)
2. `pages.*` for page-specific content (`pages.dashboard.tabs.tests`, `pages.landing.hero.title`)
3. `components.*` for component-specific strings (`components.header.nav.tests`, `components.extraction.step1`)
4. `tracking.*` for health tracking vocabulary (`tracking.bpStatus.low`, `tracking.metrics.weight`)
5. Keys always in English, camelCase segments
6. ICU format for interpolation: `"{name} added you as {role}"`
7. Numbered keys for arrays: `components.extraction.step1` through `step6`
8. No HTML in values — use `t.rich()` with React components if needed. **Never `t.raw()`.**
9. Both files must stay in sync — enforced by automated test

## Branch Strategy

- Create **new branch** `feat/i18n-bilingual` from `main` (NOT from current `feat/mobile-metrics-review-cards`)
- This ensures localization work is completely isolated from the metrics review cards work

## Acceptance Criteria

### Functional

- [ ] All user-visible Turkish text extracted to `tr.json` / `en.json` translation files
- [ ] Language toggle (TR/EN) in header works for both authenticated and unauthenticated users
- [ ] Language toggle visible on login page (standalone, not in shared header)
- [ ] Switching language updates ALL text via soft refresh (<500ms, no full page reload)
- [ ] Both locale files have identical key sets (TypeScript AppConfig + automated test)
- [ ] Default language is Turkish for all visitors without cookie
- [ ] Dates format as "Jan 15, 2026" in English, "15 Oca 2026" in Turkish
- [ ] Relative times format as "2 hours ago" in English, "2 saat once" in Turkish
- [ ] Interpolated messages handle different word orders (ICU format)
- [ ] `<html lang>` attribute updates dynamically with locale
- [ ] aria-labels and sr-only text are localized
- [ ] No leftover hardcoded Turkish strings in any component
- [ ] No in-flight fetch can produce a stale-locale toast after switching

### Quality Gates

- [ ] English end-user persona (frontend-design agent) approves ALL screens — iterate until zero issues
- [ ] Label quality review confirms consistent terminology — iterate until zero issues
- [ ] i18n key parity test passes (`tr.json` keys === `en.json` keys)
- [ ] No TypeScript errors (AppConfig type safety catches missing keys)
- [ ] No layout regressions (text expansion/contraction between TR/EN)
- [ ] Build succeeds with `--turbopack`
- [ ] Bundle size increase <10 KB gzipped

### Non-Functional

- [ ] Bundle size: only active locale loaded (not both)
- [ ] No FOWL (flash of wrong language) on page load
- [ ] Locale switch takes <500ms (soft refresh)
- [ ] Locale cookie is `httpOnly` — no client-side cookie access

## References

- [next-intl: App Router without i18n routing](https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing)
- [next-intl 4.0 release](https://next-intl.dev/blog/next-intl-4-0)
- [next-intl TypeScript AppConfig](https://next-intl.dev/docs/usage/configuration#app-config)
- Task spec: `product/tasks/bilingual-localization-en-tr.md`
- Market research: `product/research/market-validation/1b-turkish-market.md`
