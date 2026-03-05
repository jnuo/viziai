# Chrome Web Store Submission Checklist

## Assets in this folder

- [x] `store-icon-128.png` — 128x128, no alpha, white background
- [x] `screenshots/01-dashboard.png` — Dashboard with metric cards and trend chart (1280x800)
- [x] `screenshots/02-api-keys.png` — API keys settings page (1280x800)
- [x] `screenshots/03-upload.png` — Upload page with e-Nabız import section (1280x800)
- [ ] `screenshots/enabiz-buttons.png` — e-Nabız page with "ViziAI'a Gönder" buttons (MANUAL: log into enabiz.gov.tr, go to Tahlillerim, screenshot the page with buttons visible)

## Store listing text

All text is in `LISTING.md` — copy-paste into CWS developer console.

## Form fields

| Field          | Value                                                    |
| -------------- | -------------------------------------------------------- |
| Title          | ViziAI — e-Nabız                                         |
| Summary        | e-Nabız tahlil sonuçlarınızı tek tıkla ViziAI'a aktarın. |
| Description    | See LISTING.md                                           |
| Category       | Health or Productivity                                   |
| Language       | Turkish                                                  |
| Homepage URL   | https://www.viziai.app                                   |
| Support URL    | https://www.viziai.app                                   |
| Mature content | No                                                       |

## Manual steps remaining

1. Upload `viziai-enabiz-extension.zip` (already created at repo root)
2. Upload store icon from `store-icon-128.png`
3. Upload screenshots (3 automated + 1 manual e-Nabız screenshot)
4. Copy description from LISTING.md
5. Fill in additional fields
6. Set privacy practices (extension only accesses enabiz.gov.tr and viziai.app)
7. Submit for review

## Privacy practices (CWS will ask)

- **Single purpose:** Import lab results from e-Nabız into ViziAI
- **Permissions justification:**
  - `storage` — Save API key locally for authentication
  - `host_permissions (enabiz.gov.tr)` — Read lab results from e-Nabız pages
  - `host_permissions (viziai.app)` — Send imported data to ViziAI API
- **Data usage:**
  - Does NOT collect personal data for sale
  - Does NOT use data for advertising
  - Lab data is sent only to viziai.app (user's own account)
  - API key stored locally on device only

## Nice to have (optional, can add later)

- Small promo tile (440x280)
- Marquee promo tile (1400x560)
- Promo video
