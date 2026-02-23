# Task: Mobile Metrics Review Redesign (Upload Page)

**Status:** Pending
**Priority:** High
**Created:** 2026-02-23

---

## Problem

The upload review page (`/upload`) renders a 6-column editable table on mobile that is completely broken on 375px screens:

- Metric names truncated to 2-3 characters ("CR", "Gli", "Ka", "LD", "Po")
- Ref Max column and delete button pushed off-screen or invisible
- No horizontal scroll affordance — users can't access hidden columns
- 38 metrics × 5 input fields = 190 simultaneous inputs creating visual noise
- Touch targets at `h-8` (32px) are below Apple's 44px minimum
- `max-h-96` creates scroll-within-scroll on mobile (nested scroll antipattern)
- Action buttons ("İptal", "Onayla ve Kaydet") buried below 38 metrics
- Alias suggestion rows overflow horizontally, text clipped

**Meanwhile, the file detail page (`/settings/files/[id]`) already has a responsive layout** with `hidden md:block` table for desktop and `md:hidden` card list for mobile. The upload page should follow this same pattern.

## Reference Screenshot

`/Users/onurovali/Downloads/IMG_4622.PNG` — mobile screenshot showing the broken table.

## Solution

Add a responsive mobile card layout to the upload review page, matching the pattern already used in the file detail page. Keep the desktop table as-is.

## Scope

### P0 — Card layout on mobile

- Add `md:hidden` card list below `md:` breakpoint for the metrics review section
- Hide existing table on mobile with `hidden md:block`
- Each card shows: metric name (full width, editable), value + unit on one line, ref min + ref max on another line, delete button
- All fields remain editable (this is a review/correction step, unlike the read-only file detail page)
- Use 2-column grid for value/unit and ref_low/ref_high pairs (same as file detail edit mode)

### P0 — Alias suggestions in card layout

- Show alias rename info below the metric name inside the card
- Keep the Switch toggle for accept/reject
- Full-width layout prevents the horizontal overflow seen in the table

### P1 — Sticky action buttons on mobile

- Make "İptal" and "Onayla ve Kaydet" sticky at viewport bottom on mobile
- `sticky bottom-0 bg-background/95 backdrop-blur-sm border-t`
- Full-width buttons stacked vertically on mobile

### P1 — Remove nested scroll on mobile

- Remove `max-h-96` constraint on the card list
- Let the page scroll naturally — no scroll-within-scroll
- Keep `max-h-96` (or similar) for the desktop table only

### P2 — Touch target sizes

- Increase input heights to `h-10` (40px) on mobile cards
- Delete button at least 44×44px tap target

### P2 — Out-of-range visual indicators

- Add left border color coding on mobile cards: `border-l-4 border-status-critical` for out-of-range
- Consistent with brand guidelines (terracotta, not bright red)

## Implementation Notes

### Existing pattern to follow

`web/src/app/settings/files/[id]/page.tsx` lines 403-567 — the mobile card view with tap-to-edit. The upload page differs because ALL fields are editable by default (it's a review step), so cards should render in "edit mode" from the start, not require a tap.

### Files to modify

- `web/src/app/upload/page.tsx` — lines 591-779 (metrics table section) and 781-793 (action buttons)

### Card layout sketch (mobile)

```
+------------------------------------------+
| [  CRP (C-Reaktif Protein)          ] [x]|
|                                          |
|  Değer          Birim                    |
|  [  6  ]        [  mg/L  ]              |
|  Ref Min        Ref Max                  |
|  [  0  ]        [  5     ]              |
|                                          |
|  CRP → CRP (C-Reaktif Protein) [toggle]  |
|  "CRP (C-Reaktif Protein) olarak..."    |
+------------------------------------------+
```

### Desktop — no changes

The existing table at `hidden md:block` works fine on wider screens.

## Out of Scope

- File detail page — already has responsive card layout, no changes needed
- Category grouping of metrics (future enhancement)
- Summary banner with out-of-range count/filter (future enhancement)
- Metric name tap-to-edit on file detail page (different use case: read-only view with occasional edits)
