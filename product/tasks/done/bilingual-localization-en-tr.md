# Bilingual Localization (Turkish + English)

**Status:** Done
**Priority:** High
**Branch:** `feat/i18n-bilingual`

## Problem

Every label, button, heading, error message, placeholder, and status text in the app is hardcoded in Turkish. The app needs to support both Turkish and English, with the ability to switch between them.

## Scope

- ~200 unique string keys across ~25 files
- No i18n library or locale infrastructure exists yet
- Turkish is the only language currently present

## Categories of Text to Localize

| Category                   | Example (TR)                          | Example (EN)                        | Est. Keys |
| -------------------------- | ------------------------------------- | ----------------------------------- | --------- |
| Navigation & headers       | Tahliller, Ayarlar, Profiller         | Tests, Settings, Profiles           | ~15       |
| Action buttons             | Yükle, Sil, İptal, Kaydet             | Upload, Delete, Cancel, Save        | ~20       |
| Form labels & placeholders | Profil seçin, Tahlil Tarihi           | Select profile, Test Date           | ~15       |
| Status messages            | Yükleniyor…, Kaydediliyor…            | Loading…, Saving…                   | ~10       |
| Error messages             | Dosyalar yüklenemedi, Bilinmeyen hata | Failed to load files, Unknown error | ~25       |
| Toast notifications        | Dosya silindi, Güncellendi            | File deleted, Updated               | ~15       |
| Data table headers         | Metrik, Değer, Birim, Durum           | Metric, Value, Unit, Status         | ~10       |
| Empty states               | Henüz tahlil raporu yok               | No test reports yet                 | ~5        |
| Landing/marketing copy     | Tahlil Sonuçlarını Kolayca Anlayın    | Understand Your Test Results Easily | ~15       |
| Dialogs & confirmations    | {count} metrik silinecek              | {count} metrics will be deleted     | ~15       |
| Accessibility (aria)       | Metrik ara, Aramayı temizle           | Search metrics, Clear search        | ~10       |
| Extraction/loading steps   | PDF okunuyor…, AI Analiz Ediyor       | Reading PDF…, AI Analyzing          | ~8        |
| Tracking labels            | Kilo, Tansiyon (Sistolik)             | Weight, Blood Pressure (Systolic)   | ~8        |
| Validation messages        | Geçerli bir kilo değeri girin         | Enter a valid weight value          | ~10       |
| Auth                       | Google ile Giriş Yap                  | Sign in with Google                 | ~5        |

**Total estimate: ~200 keys**

## Implementation Plan

### Phase 0: Infrastructure

1. Install `next-intl` (best Next.js App Router support)
2. Create locale files structure:
   ```
   web/src/
     i18n/
       request.ts          # next-intl config
       locales/
         tr.json            # Turkish translations (source of truth)
         en.json            # English translations
   ```
3. Set up `NextIntlClientProvider` in root layout
4. Add language switcher to header (simple TR/EN toggle)
5. Store preference in `localStorage` (no DB column needed)
6. Default language: Turkish (existing users shouldn't see a sudden change)

### Phase 1: Core UI (highest visibility)

- `header.tsx` — nav labels, theme toggle, logout
- `app/page.tsx` — landing page copy
- `app/login/page.tsx` — auth labels, errors
- `app/dashboard/page.tsx` — tab labels, controls, tooltips, empty states
- `empty-state.tsx` — headings, CTAs

### Phase 2: Upload & File Management

- `app/upload/page.tsx` — form labels, placeholders, extraction status, errors
- `extraction-loading.tsx` — loading step messages
- `app/settings/page.tsx` — file list, deletion confirmations
- `app/settings/files/[id]/page.tsx` — file detail labels

### Phase 3: Components & Dialogs

- `tracking-history.tsx` — edit/delete flows, validation
- `add-blood-pressure-dialog.tsx` — form labels, toasts
- `profile-switcher.tsx` — labels
- All remaining components with UI text

### Phase 4: API Error Messages

- Standardize API error response strings
- Localize client-side error display (API can stay English-only, frontend maps to locale)

## Best Practices for Adding Translation Keys

### Key Naming Convention

Use **dot-separated, hierarchical keys** organized by feature, then by element type:

```
{page/component}.{section}.{element}
```

**Examples:**

```json
{
  "dashboard.tabs.tests": "Tahliller",
  "dashboard.tabs.weight": "Kilo",
  "dashboard.tabs.bloodPressure": "Tansiyon",
  "dashboard.empty.title": "Henüz tahlil raporu yok",
  "dashboard.empty.cta": "İlk Tahlilini Yükle",
  "upload.form.selectProfile": "Profil seçin",
  "upload.form.testDate": "Tahlil Tarihi",
  "upload.status.reading": "PDF okunuyor…",
  "upload.errors.invalidFile": "Sadece PDF dosyaları kabul edilir",
  "common.actions.save": "Kaydet",
  "common.actions.cancel": "İptal",
  "common.actions.delete": "Sil",
  "common.status.loading": "Yükleniyor…",
  "common.errors.unknown": "Bilinmeyen hata"
}
```

### Rules

1. **`common.*` for shared strings** — buttons, status words, generic errors that appear in 2+ places
2. **Feature-scoped for everything else** — `dashboard.*`, `upload.*`, `settings.*`, `auth.*`, `landing.*`
3. **Keys are always English** — even though Turkish is the source language. Keys describe the content, not the translation.
4. **camelCase for key segments** — `bloodPressure`, not `blood-pressure` or `blood_pressure`
5. **Never reuse keys for different meanings** — if "Normal" means a health status in one place and a sort order in another, use different keys
6. **Interpolation for dynamic values** — use `next-intl` ICU syntax:
   ```json
   "settings.files.deleteConfirm": "{count} metrik silinecek.",
   "upload.errors.maxSize": "Maksimum dosya boyutu {maxSize}."
   ```
7. **Plurals** — use ICU plural syntax:
   ```json
   "dashboard.metrics.count": "{count, plural, one {# metrik} other {# metrik}}"
   ```
8. **No HTML in translation values** — keep translations plain text. Wrap with markup in the component.
9. **Keep both locale files in sync** — every key in `tr.json` must exist in `en.json` and vice versa. Missing keys should cause a build warning.

### Code Pattern

```tsx
// Before (hardcoded Turkish)
<Button>Yükle</Button>
<p>Dosyalar yüklenemedi</p>

// After (localized)
import { useTranslations } from 'next-intl';

function UploadPage() {
  const t = useTranslations('upload');
  return (
    <>
      <Button>{t('actions.upload')}</Button>
      <p>{t('errors.loadFailed')}</p>
    </>
  );
}
```

### For Server Components

```tsx
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  return <h1>{t("title")}</h1>;
}
```

## What NOT to Localize

- **Metric names from the database** — these come from lab PDFs and the alias system. Don't put "Hemoglobin" in locale files.
- **User-generated content** — profile names, notes
- **API internal error codes** — keep API responses in English, map to localized messages on the frontend
- **Brand name** — "ViziAI" stays as-is in both languages
- **URLs and routes** — no localized URL slugs needed

## Date & Number Formatting

- Dates: use `next-intl`'s `useFormatter()` instead of the current `formatTR()` helpers
- Numbers: Turkish uses comma as decimal separator (3,5), English uses period (3.5) — `useFormatter()` handles this
- Remove `formatTR()` and `formatDateTimeTR()` utilities after migration

## Language Switcher UX

- Simple toggle in the header: **TR** | **EN**
- Persisted in `localStorage` under key `locale`
- Default: `tr` (preserves current experience)
- No URL-based routing (`/en/dashboard`) — overkill for 2 languages with a preference toggle

## Acceptance Criteria

- [ ] All user-visible Turkish text uses translation keys
- [ ] Language toggle in header switches all text instantly (no page reload)
- [ ] Both `tr.json` and `en.json` have identical key sets
- [ ] Default language is Turkish
- [ ] No regressions in layout or functionality
- [ ] Dynamic content (interpolation, plurals) works in both languages
- [ ] Date/number formatting adapts to selected locale
