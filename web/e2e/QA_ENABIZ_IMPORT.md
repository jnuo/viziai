# QA Test Cases: e-Nabız Chrome Extension Review Flow

Issue #64. Covers the full import pipeline: extension → pending import → review page → confirmed report.

---

## Pre-requisites

- [ ] Run migrations on Neon `dev` branch:
  - `20260305_drop_reports_date_unique.sql`
  - `20260305_pending_imports.sql`
  - `20260305_user_api_keys.sql`
- [ ] Load extension unpacked in Chrome (`chrome://extensions` → Load unpacked → `extension/`)
- [ ] Configure extension settings: API key + profile ID + environment (local or staging)
- [ ] Have a ViziAI account with at least one profile

---

## 1. Database Migration

### 1.1 UNIQUE constraint dropped

- [ ] Verify `reports_profile_id_sample_date_key` constraint no longer exists
- [ ] Verify `idx_reports_profile_date` index exists
- [ ] **Test**: Insert two reports with same `profile_id` and `sample_date` — should succeed

### 1.2 pending_imports table created

- [ ] Table exists with all columns: id, profile_id, user_id, source, content_hash, sample_date, hospital_name, metrics, status, created_at, expires_at
- [ ] Default status is 'pending', default expires_at is NOW() + 24h
- [ ] CHECK constraint rejects invalid status values

### 1.3 API key column added

- [ ] `users.api_key` column exists (UUID, UNIQUE)
- [ ] Existing users have auto-generated keys

---

## 2. PDF Upload Flow (Regression)

### 2.1 Upload still works after UNIQUE removal

- [ ] Upload a PDF → extract → review → confirm → report created
- [ ] Upload a **second PDF for the same date** → should create a new report (not merge)
- [ ] Both reports visible in Settings → Uploaded Files

### 2.2 Duplicate detection still works

- [ ] Upload the same PDF twice → second attempt returns 409 (content hash match)

---

## 3. API: POST /api/import/enabiz/pending

### 3.1 Authentication

- [ ] No Authorization header → 401
- [ ] Invalid API key → 401
- [ ] Valid API key → 200

### 3.2 Authorization

- [ ] API key belongs to user without access to profileId → 403
- [ ] API key belongs to user with access → 200

### 3.3 Validation

- [ ] Missing profileId → 400
- [ ] Missing date → 400
- [ ] Missing contentHash → 400
- [ ] Empty metrics array → 400
- [ ] Valid request → 200 with `{ id, collision: null }`

### 3.4 Dedup (content hash)

- [ ] Import a report → confirm it → import same contentHash again → 409 "already imported"
- [ ] Import a report → DON'T confirm → import same contentHash → should create new pending (processed_files only written on confirm)

### 3.5 Collision detection

- [ ] Profile has no reports on that date → collision is null
- [ ] Profile has a report on that date → collision returned with similarity score
- [ ] Upload PDF for date X, then e-Nabız import for same date X with identical metrics → similarity > 80%
- [ ] Upload PDF for date X, then e-Nabız import for same date X with totally different metrics → similarity < 20%

---

## 4. API: GET /api/import/enabiz/pending/[id]

### 4.1 Authentication

- [ ] Not logged in → 401
- [ ] Logged in but no profile access → 403
- [ ] Logged in with access → 200

### 4.2 Status handling

- [ ] Pending import with status 'pending' → returns full data + `processed: false`
- [ ] Pending import with status 'confirmed' → returns `processed: true`
- [ ] Pending import with status 'skipped' → returns `processed: true`
- [ ] Expired pending import (expires_at < now) → returns `processed: true`

### 4.3 Response data

- [ ] Includes import details (metrics, date, hospital)
- [ ] Includes collision info if same-date report exists
- [ ] Includes alias map

---

## 5. API: POST /api/import/enabiz/pending/[id]/confirm

### 5.1 Access control

- [ ] Not logged in → 401
- [ ] Viewer access → 403
- [ ] Editor access → 200
- [ ] Owner access → 200

### 5.2 Status checks

- [ ] Already confirmed → 400
- [ ] Already skipped → 400
- [ ] Expired → 410

### 5.3 Skip action

- [ ] `collisionAction: "skip"` → status becomes 'skipped', no report created
- [ ] Redirect to dashboard works

### 5.4 Create separate (no collision)

- [ ] No collision, valid metrics → new report created with source 'enabiz'
- [ ] Metrics inserted correctly (name, value, unit, ref_low, ref_high, flag)
- [ ] metric_preferences upserted
- [ ] processed_files recorded (content hash)
- [ ] pending_import status → 'confirmed'

### 5.5 Create separate (with collision)

- [ ] `collisionAction: "create_separate"` → new report created alongside existing
- [ ] Both reports visible in Settings

### 5.6 Overwrite

- [ ] `collisionAction: "overwrite"` with valid `collisionReportId` → existing report's metrics deleted and replaced
- [ ] Report source updated to 'enabiz'
- [ ] Old metrics gone, new metrics present

### 5.7 Edge cases

- [ ] Metrics with invalid values (NaN) skipped silently
- [ ] ON CONFLICT on metrics handles duplicate metric names within same report

---

## 6. Review Page: /import/enabiz/[id]

### 6.1 Loading & auth

- [ ] Not logged in → redirects to /login?redirect=/import/enabiz/{id}
- [ ] Logged in → loads import data and shows review form

### 6.2 Already processed

- [ ] Visit URL after confirm → shows "Import Already Processed" message + button to dashboard
- [ ] Visit URL after skip → same
- [ ] Visit URL after expiry → same

### 6.3 Source badge

- [ ] "e-Nabız" badge displayed in teal
- [ ] Hospital name shown (if available)

### 6.4 Metric table (desktop)

- [ ] All metrics displayed with name, value, unit, ref min, ref max
- [ ] Out-of-range metrics highlighted with red background
- [ ] Metric name editable
- [ ] Value editable (numeric)
- [ ] Unit editable
- [ ] Ref range editable
- [ ] Delete button removes metric

### 6.5 Metric cards (mobile)

- [ ] Cards display on small screens
- [ ] Expandable with edit form
- [ ] Delete confirmation flow

### 6.6 Alias suggestions

- [ ] Known alias → shows rename suggestion with toggle
- [ ] Toggle ON → metric name shows canonical name
- [ ] Toggle OFF → metric name reverts to original
- [ ] Suggestion text shows "will be added as" / "will stay as"

### 6.7 Date picker

- [ ] Pre-filled with scraped date
- [ ] Editable

### 6.8 Collision banner

- [ ] **No collision**: banner not shown, confirm button enabled
- [ ] **High similarity (>80%)**: banner shows "looks like the same report" message
- [ ] **Low similarity (<80%)**: banner shows "different report for same date" message
- [ ] Similarity percentage and metric overlap counts displayed
- [ ] Three radio options: Skip / Overwrite / Create separate
- [ ] **Must select an option before confirm is enabled**
- [ ] Selecting "Skip" and confirming → redirects to dashboard

### 6.9 Confirm flow

- [ ] Click "Confirm & Save" → loading spinner → success message → auto-redirect to dashboard
- [ ] Confirm button disabled when: no date, no metrics, collision without action selected
- [ ] Error on confirm → shows error message, stays on review page

### 6.10 Skip button

- [ ] Always available (separate from collision skip)
- [ ] Marks import as skipped → redirects to dashboard

---

## 7. Chrome Extension

### 7.1 Button placement

- [ ] "ViziAI'a Aktar" button appears next to PDF buttons (not overlapping card chevron)
- [ ] Button styled with teal ViziAI branding
- [ ] "ViziAI" text in bold teal within the button

### 7.2 Settings page

- [ ] Right-click extension icon → Options opens settings popup
- [ ] API key field, Profile ID field, Environment dropdown
- [ ] Save persists values to chrome.storage.sync
- [ ] Values reload on reopen

### 7.3 Import flow

- [ ] Click button → button shows "Gönderiliyor…" (disabled)
- [ ] Success → new tab opens at `/import/enabiz/{id}` → button shows "ViziAI'da açıldı ✓"
- [ ] No API key → error message on button
- [ ] No profile ID → error message on button
- [ ] Duplicate (409) → shows "Bu rapor zaten aktarılmış"
- [ ] Network error → shows "Bir hata oluştu", resets after 3 seconds

### 7.4 DOM scraping

- [ ] Date extracted correctly (DD.MM.YYYY → YYYY-MM-DD)
- [ ] Hospital name extracted (if present)
- [ ] Metrics scraped from expanded report panel (name, value, unit, ref range)
- [ ] Content hash computed from `date|hospital|normalCount|outOfRefCount`

### 7.5 No "Import All" button

- [ ] Only per-report import buttons, no bulk import

---

## 8. Middleware

- [ ] `/import/enabiz/{id}` requires authentication (redirects to login if not signed in)
- [ ] Login redirect includes `?redirect=/import/enabiz/{id}` so user returns after sign-in
- [ ] `/api/import/enabiz/pending` POST is NOT in protectedApiRoutes (uses API key auth)

---

## 9. i18n

- [ ] All 5 locale files (tr, en, es, de, fr) have `pages.enabizImport` keys
- [ ] Review page renders correctly in all languages
- [ ] Collision banner text renders correctly
- [ ] No missing translation warnings in console

---

## 10. Security

- [ ] API key auth cannot access session-protected routes
- [ ] Session auth cannot bypass API key routes
- [ ] Viewer role cannot confirm imports (403)
- [ ] IDOR: user A's API key cannot create imports for user B's profile
- [ ] Pending import only accessible by users with access to the profile
- [ ] Expired imports cannot be confirmed (410)
- [ ] URL is single-use: after confirm/skip, page shows "already processed"
