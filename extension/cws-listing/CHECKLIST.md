# Chrome Web Store Submission Checklist

## Assets in this folder

- [x] `store-icon-128.png` — 128x128, no alpha, white background

### Screenshots (1280x800, follow guide step order)

- [x] `01-extension-installed.png` — Chrome extensions panel showing ViziAI installed
- [ ] `02-api-keys.png` — API keys page with new redesigned dialog (RETAKE: old UI)
- [ ] `03-paste-key.png` — Extension popup with key input field (NEEDED)
- [x] `04-popup-connected.png` — Extension popup showing green "connected" state
- [x] `05-enabiz-buttons.png` — e-Nabiz page with "ViziAI'a Gonder" buttons
- [x] `06-dashboard.png` — Dashboard with metric cards and trend chart (end result)

### Old screenshots (to delete after retaking)

- `02-api-keys.png.old` — old API keys UI before redesign
- `_old-upload.png` — old upload page with 3-step inline guide

## Store listing text

All text is in `LISTING.md` — copy-paste into CWS developer console.

## Form fields

| Field          | Value                                                    |
| -------------- | -------------------------------------------------------- |
| Title          | ViziAI — e-Nabiz                                         |
| Summary        | e-Nabiz tahlil sonuclarinizi tek tikla ViziAI'a aktarin. |
| Description    | See LISTING.md                                           |
| Category       | Health or Productivity                                   |
| Language       | Turkish                                                  |
| Homepage URL   | https://www.viziai.app                                   |
| Support URL    | https://www.viziai.app                                   |
| Mature content | No                                                       |

## Manual steps remaining

1. Retake `02-api-keys.png` — new redesigned dialog with profile indicator
2. Take `03-paste-key.png` — extension popup showing key input (before connecting)
3. Upload `viziai-enabiz-extension.zip` (already created at repo root)
4. Upload store icon from `store-icon-128.png`
5. Upload all 6 screenshots in order
6. Copy description from LISTING.md
7. Fill in additional fields
8. Set privacy practices
9. Submit for review

## Privacy practices (CWS will ask)

- **Single purpose:** Import lab results from e-Nabiz into ViziAI
- **Permissions justification:**
  - `storage` — Save API key locally for authentication
  - `host_permissions (enabiz.gov.tr)` — Read lab results from e-Nabiz pages
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
