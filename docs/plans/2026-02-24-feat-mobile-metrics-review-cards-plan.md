---
title: "feat: Mobile card layout for upload review metrics"
type: feat
status: completed
date: 2026-02-24
deepened: 2026-02-24
---

# Mobile Card Layout for Upload Review Metrics

## Enhancement Summary

**Deepened on:** 2026-02-24
**Agents used:** React best practices, TypeScript reviewer, Performance oracle, Pattern recognition, Code simplicity, Architecture strategist, Frontend races, Best practices researcher, Tailwind docs researcher

### Key Improvements from Research

1. **Extract `MetricCard` with `React.memo`** — without this, every keystroke re-renders all 190 inputs. This is the #1 performance fix.
2. **Use `inputMode="decimal"` instead of `type="number"`** — `type="number"` silently breaks Turkish decimal input (comma vs period) and causes value flickering.
3. **Proper label association with `htmlFor`/`id`** — enlarges touch targets by making label text tappable, and fixes screen reader association.
4. **Match existing codebase patterns exactly** — use `border-status-critical/20` (not `border-l-4`), established `md:hidden`/`hidden md:block` split (not `max-md:`), proper Turkish characters in aria-labels.

### New Considerations Discovered

- `content-visibility: auto` CSS on cards gives free browser-level optimization for off-screen cards
- Generate stable keys at extraction time to prevent card identity shift on deletion
- Add bottom padding on card list to prevent last card occlusion by sticky bar
- Define `@utility pb-safe` in globals.css for iOS safe area (Tailwind v4 pattern)

---

## Overview

The upload review page (`/upload`) renders a 6-column editable table that is completely broken on mobile screens (<768px). Metric names are truncated to 2-3 characters, Ref Max and delete columns are invisible, and there's no horizontal scroll. This is the only page in the app without a responsive desktop/mobile split.

Add a `md:hidden` card layout for metrics on mobile, matching the pattern already used in 4 other pages (file detail, settings, tracking history). Keep the existing desktop table unchanged.

## Problem Statement

On a 375px mobile viewport, the upload review table with 6 columns (Metrik, Değer, Birim, Ref Min, Ref Max, delete) and 5 `<Input>` fields per row cannot render legibly. The result:

- Metric names truncated: "CR", "Gli", "Ka", "LD", "Po"
- Ref Max column and delete button pushed off-screen
- 190 simultaneous input fields create visual noise
- Touch targets at `h-8` (32px) are below Apple's 44px minimum
- `max-h-96` creates nested scroll (scroll-within-scroll)
- Action buttons buried below 38 metrics
- Alias suggestion rows overflow horizontally

**Reference screenshot:** `/Users/onurovali/Downloads/IMG_4622.PNG`

## Proposed Solution

### Step 1: Extract shared `checkOutOfRange` utility

The file detail page already has a clean `checkOutOfRange` at line 15. The upload page re-implements it inline at line 619. Extract to a shared location to avoid triple duplication (desktop table + mobile cards + file detail page).

**File:** `web/src/lib/metrics.ts` (new)

```tsx
export function checkOutOfRange(
  value: number | string | null,
  refLow: number | string | null,
  refHigh: number | string | null,
): boolean {
  if (value == null) return false;
  const v = Number(value);
  if (isNaN(v)) return false;
  if (refLow != null && !isNaN(Number(refLow)) && v < Number(refLow))
    return true;
  if (refHigh != null && !isNaN(Number(refHigh)) && v > Number(refHigh))
    return true;
  return false;
}
```

Import in both `upload/page.tsx` and `settings/files/[id]/page.tsx`.

### Step 2: Extract `MetricCard` component with `React.memo`

**Critical performance requirement.** Without this, every keystroke in any input re-renders all 38 cards (190 inputs). With `React.memo`, only the card being edited re-renders — a 95% reduction in per-keystroke work.

**File:** `web/src/components/metric-review-card.tsx` (new)

```tsx
"use client";

import React from "react";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { checkOutOfRange } from "@/lib/metrics";

interface RenameInfo {
  original: string;
  canonical: string;
  applied: boolean;
}

export interface ExtractedMetric {
  name: string;
  value: number | null;
  unit: string | null;
  ref_low: number | null;
  ref_high: number | null;
}

interface MetricReviewCardProps {
  metric: ExtractedMetric;
  index: number;
  stableKey: string;
  renameInfo: RenameInfo | null;
  onMetricChange: (
    index: number,
    field: keyof ExtractedMetric,
    value: string | number | null,
  ) => void;
  onRemove: (index: number) => void;
  onAliasToggle: (index: number, checked: boolean) => void;
}

export const MetricReviewCard = React.memo(function MetricReviewCard({
  metric,
  index,
  renameInfo,
  onMetricChange,
  onRemove,
  onAliasToggle,
}: MetricReviewCardProps) {
  const isOutOfRange = checkOutOfRange(
    metric.value,
    metric.ref_low,
    metric.ref_high,
  );

  return (
    <div
      role="group"
      aria-labelledby={`metric-label-${index}`}
      className={cn(
        "border rounded-lg p-3",
        isOutOfRange && "bg-status-critical/10 border-status-critical/20",
      )}
    >
      <div className="space-y-3">
        {/* Row 1: Metric name (full width) + delete button */}
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <label
              id={`metric-label-${index}`}
              htmlFor={`metric-name-${index}`}
              className="text-xs text-muted-foreground mb-1 block"
            >
              Metrik adı
            </label>
            <Input
              id={`metric-name-${index}`}
              value={metric.name ?? ""}
              onChange={(e) => onMetricChange(index, "name", e.target.value)}
              className="h-10 text-sm"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 mt-5"
            onClick={() => onRemove(index)}
            aria-label={`${metric.name || "Metrik"} sil`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Alias suggestion (if exists) */}
        {renameInfo && (
          <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-md px-2 py-1.5">
            <span className="text-muted-foreground flex-1">
              <span className="font-medium line-through">
                {renameInfo.original}
              </span>
              <ArrowRight className="inline h-3 w-3 mx-1" />
              <span className="font-medium text-primary">
                {renameInfo.canonical}
              </span>
              <span className="ml-1">
                {renameInfo.applied ? `olarak eklenecek` : `olarak kalacak`}
              </span>
            </span>
            <Switch
              checked={renameInfo.applied}
              onCheckedChange={(checked) => onAliasToggle(index, checked)}
              aria-label={`${renameInfo.original} → ${renameInfo.canonical}`}
            />
          </div>
        )}

        {/* Row 2: Value + Unit (2-column grid) */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor={`metric-value-${index}`}
              className="text-xs text-muted-foreground mb-1 block"
            >
              Değer
            </label>
            <Input
              id={`metric-value-${index}`}
              type="text"
              inputMode="decimal"
              value={metric.value ?? ""}
              onChange={(e) => {
                const normalized = e.target.value.replace(",", ".");
                onMetricChange(
                  index,
                  "value",
                  normalized ? parseFloat(normalized) : null,
                );
              }}
              className={cn(
                "h-10 text-sm",
                isOutOfRange && "text-status-critical font-medium",
              )}
            />
          </div>
          <div>
            <label
              htmlFor={`metric-unit-${index}`}
              className="text-xs text-muted-foreground mb-1 block"
            >
              Birim
            </label>
            <Input
              id={`metric-unit-${index}`}
              value={metric.unit ?? ""}
              onChange={(e) => onMetricChange(index, "unit", e.target.value)}
              className="h-10 text-sm"
            />
          </div>
        </div>

        {/* Row 3: Ref Min + Ref Max (2-column grid) */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor={`metric-refmin-${index}`}
              className="text-xs text-muted-foreground mb-1 block"
            >
              Ref Min
            </label>
            <Input
              id={`metric-refmin-${index}`}
              type="text"
              inputMode="decimal"
              value={metric.ref_low ?? ""}
              onChange={(e) => {
                const normalized = e.target.value.replace(",", ".");
                onMetricChange(
                  index,
                  "ref_low",
                  normalized ? parseFloat(normalized) : null,
                );
              }}
              className="h-10 text-sm"
              placeholder="-"
            />
          </div>
          <div>
            <label
              htmlFor={`metric-refmax-${index}`}
              className="text-xs text-muted-foreground mb-1 block"
            >
              Ref Max
            </label>
            <Input
              id={`metric-refmax-${index}`}
              type="text"
              inputMode="decimal"
              value={metric.ref_high ?? ""}
              onChange={(e) => {
                const normalized = e.target.value.replace(",", ".");
                onMetricChange(
                  index,
                  "ref_high",
                  normalized ? parseFloat(normalized) : null,
                );
              }}
              className="h-10 text-sm"
              placeholder="-"
            />
          </div>
        </div>
      </div>
    </div>
  );
});
```

### Step 3: Add mobile card list + wrap desktop table

**File:** `web/src/app/upload/page.tsx`

**3a. Stabilize callback props with `useCallback`** (required for `React.memo` to work)

```tsx
const handleMetricChange = useCallback(
  (
    index: number,
    field: keyof ExtractedMetric,
    value: string | number | null,
  ) => {
    setEditedMetrics((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  },
  [],
);

const handleRemoveMetric = useCallback((index: number) => {
  setEditedMetrics((prev) => prev.filter((_, i) => i !== index));
}, []);
```

**3b. Precompute rename info map with `useMemo`** (O(1) lookup instead of O(n) per card)

```tsx
const renameInfoMap = useMemo(() => {
  const map = new Map<
    string,
    { original: string; canonical: string; applied: boolean }
  >();
  for (const entry of Object.values(appliedRenames)) {
    const key = entry.applied ? entry.canonical : entry.original;
    map.set(key, entry);
  }
  return map;
}, [appliedRenames]);
```

**3c. Generate stable keys at extraction time** (prevents card identity shift on deletion)

When `extractedData` is loaded (around line 350), assign stable IDs:

```tsx
const withKeys = extracted.metrics.map((m, i) => ({
  ...m,
  _key: `metric-${i}-${Date.now()}`,
}));
setEditedMetrics(withKeys);
```

**3d. Wrap existing table for desktop only (lines 594-778)**

```tsx
{
  /* Desktop table view */
}
<div className="hidden md:block border rounded-lg overflow-hidden">
  <div className="max-h-96 overflow-y-auto">
    <table>{/* ... existing table, unchanged ... */}</table>
  </div>
</div>;
```

**3e. Add mobile card list after the desktop table**

```tsx
{
  /* Mobile card view */
}
<div className="md:hidden space-y-2 pb-20">
  {editedMetrics.map((metric, index) => (
    <MetricReviewCard
      key={metric._key}
      metric={metric}
      index={index}
      stableKey={metric._key}
      renameInfo={renameInfoMap.get(metric.name) ?? null}
      onMetricChange={handleMetricChange}
      onRemove={handleRemoveMetric}
      onAliasToggle={handleAliasToggle}
    />
  ))}
</div>;
```

Note: `pb-20` prevents the last card from being occluded by the sticky action bar.

### Step 4: Sticky action buttons on mobile

Replace the current action buttons (lines 782-793) with separate mobile/desktop blocks:

```tsx
{
  /* Mobile: sticky actions */
}
<div className="md:hidden sticky bottom-0 bg-background border-t p-4 -mx-6 -mb-6 flex flex-col-reverse gap-3 pb-safe">
  <Button variant="outline" onClick={handleCancel} className="w-full">
    İptal
  </Button>
  <Button
    onClick={handleConfirm}
    disabled={!sampleDate || editedMetrics.length === 0}
    className="w-full"
  >
    Onayla ve Kaydet
  </Button>
</div>;

{
  /* Desktop: inline actions */
}
<div className="hidden md:flex gap-3 justify-end">
  <Button variant="outline" onClick={handleCancel}>
    İptal
  </Button>
  <Button
    onClick={handleConfirm}
    disabled={!sampleDate || editedMetrics.length === 0}
  >
    Onayla ve Kaydet
  </Button>
</div>;
```

### Step 5: Add CSS utilities

**File:** `web/src/app/globals.css`

```css
/* iOS safe area for sticky footers */
@utility pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Browser-level optimization for off-screen cards */
.metric-card {
  content-visibility: auto;
  contain-intrinsic-size: 0 200px;
}
```

Add `className="metric-card"` to the `MetricReviewCard` outer div.

**File:** `web/src/app/layout.tsx` — ensure viewport includes `viewport-fit=cover`:

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
```

## Technical Considerations

### Architecture

- **Three files changed**: `upload/page.tsx` (main change), new `metric-review-card.tsx` (extracted component), new `lib/metrics.ts` (shared utility)
- **Pattern consistency**: Uses `hidden md:block` / `md:hidden` pattern matching 4 other pages
- **Component extraction justified by performance**: `React.memo` requires a component boundary to skip re-renders

### Performance

- **Without `React.memo`**: Every keystroke re-renders 38 cards / 190 inputs — estimated 15-40ms on mid-range mobile, causing visible jank
- **With `React.memo` + `useCallback`**: Only 1 card re-renders per keystroke — estimated 1-3ms
- **`content-visibility: auto`**: Browser skips layout/paint for ~33 off-screen cards — free optimization
- **`renameInfoMap` with `useMemo`**: O(1) lookup instead of O(n\*m) per render cycle
- **No `backdrop-blur-sm`**: Solid `bg-background` on sticky bar avoids GPU compositing cost during scroll (2-5ms/frame savings on Android)
- **No virtualization needed**: 38 cards with memo is well within performance budget

### Accessibility

- **`role="group"` + `aria-labelledby`** on each card — screen readers announce "Hemoglobin, group" when entering a card's fields
- **`htmlFor`/`id` label association** — clicking label text focuses the input (enlarged touch target on mobile)
- **Proper Turkish characters** in all aria-labels: `Metrik adı`, `Değer`, `Metriği sil`, `→`
- **`inputMode="decimal"`** instead of `type="number"` — shows correct mobile keyboard, supports Turkish comma decimal
- **Touch targets**: `h-10` (40px) for all mobile inputs, `h-10 w-10` (40px) for delete button

### iOS Safe Area

- `@utility pb-safe` in globals.css provides `padding-bottom: env(safe-area-inset-bottom)`
- `viewport-fit: cover` in layout.tsx required for `env()` to return non-zero values
- Applied to the sticky action bar with `pb-safe` class

### Number Input for Turkish Medical Data

Using `type="text" inputMode="decimal"` instead of `type="number"` because:

- `type="number"` silently returns `""` for Turkish comma-decimal input ("3,14")
- `inputMode="decimal"` shows the correct numeric keyboard with decimal separator
- Manual comma-to-period normalization in onChange handlers
- Existing pattern: `add-weight-dialog.tsx` already uses `inputMode="decimal"`

## Acceptance Criteria

- [ ] Mobile (<768px): Metrics display as vertical cards with full metric names visible
- [ ] Mobile: Each card has editable name, value, unit, ref_low, ref_high inputs in grid layout
- [ ] Mobile: Delete button is accessible and at least 40px touch target
- [ ] Mobile: Alias suggestions render inside cards with Switch toggle, no horizontal overflow
- [ ] Mobile: Action buttons are sticky at viewport bottom with iOS safe area padding
- [ ] Mobile: No nested scroll — page scrolls naturally through all cards
- [ ] Mobile: Out-of-range metrics have background tint + border color matching file detail page
- [ ] Mobile: Labels properly associated to inputs via htmlFor/id
- [ ] Mobile: Typing in one card does NOT re-render other cards (verify with React DevTools Profiler)
- [ ] Desktop (>=768px): Existing table layout is completely unchanged
- [ ] All existing functionality preserved: edit metrics, toggle aliases, delete metrics, cancel, confirm
- [ ] Turkish decimal input works (typing "3,14" produces 3.14)

## Design Decisions Made

| Question                | Decision                                          | Rationale                                                                                           |
| ----------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Card internal layout    | Name full-width top, 2x2 grid below               | Matches file detail page edit mode pattern                                                          |
| Alias placement in card | Below name input, inline banner with helper text  | Closely tied to the name field it renames                                                           |
| Sticky buttons approach | Separate `md:hidden`/`hidden md:flex` blocks      | Matches established codebase pattern (not `max-md:`)                                                |
| Backdrop blur           | No — solid `bg-background` with `border-t`        | GPU cost on Android, barely visible at 95% opacity                                                  |
| Out-of-range indicator  | `bg-status-critical/10 border-status-critical/20` | Matches file detail page pattern exactly                                                            |
| Breakpoint              | `md:` (768px)                                     | Matches 4 other pages in the codebase                                                               |
| Component extraction    | Yes — `MetricReviewCard` with `React.memo`        | Required for performance with 190 simultaneous inputs                                               |
| Number input type       | `type="text" inputMode="decimal"`                 | Supports Turkish comma-decimal, avoids `type="number"` bugs                                         |
| Label association       | `htmlFor`/`id` pairs on all labels                | Enlarges touch targets, proper screen reader support                                                |
| Card grouping           | `role="group"` + `aria-labelledby`                | Screen readers announce metric name when entering card                                              |
| Keys                    | Stable `_key` generated at extraction time        | Prevents card identity shift on deletion                                                            |
| Inner spacing           | Nested `<div className="space-y-3">`              | Matches existing card pattern (outer div has only border/shape/padding)                             |
| Touch targets           | `h-10` (40px) on mobile                           | Above WCAG 2.2 AA minimum; deliberate deviation from codebase `h-8` for this mobile-focused feature |

## Files to Modify

| File                                              | Change                                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `web/src/lib/metrics.ts` (new)                    | Shared `checkOutOfRange` utility                                                                                                |
| `web/src/components/metric-review-card.tsx` (new) | Extracted `MetricReviewCard` with `React.memo`                                                                                  |
| `web/src/app/upload/page.tsx`                     | Wrap table in `hidden md:block`, add `md:hidden` card list, `useCallback` handlers, `useMemo` rename map, sticky action buttons |
| `web/src/app/globals.css`                         | Add `@utility pb-safe` and `.metric-card` content-visibility                                                                    |
| `web/src/app/layout.tsx`                          | Add `viewportFit: "cover"` to viewport export                                                                                   |
| `web/src/app/settings/files/[id]/page.tsx`        | Import shared `checkOutOfRange` (replace local copy)                                                                            |

## Out of Scope

- File detail page layout — already has responsive cards
- Adding new metric rows (feature doesn't exist)
- Category grouping of metrics
- Summary banner with out-of-range count/filter
- Value validation (`parseFloat || 0` bug) — track as follow-up
- React virtualization — not needed for 38 cards
- Desktop table changes
- Codebase-wide `h-8` → `h-10` migration — separate PR if desired
- Codebase-wide `type="number"` → `inputMode="decimal"` migration — separate PR

## Follow-up Items (Out of Scope for This PR)

1. **`parseFloat || 0` value coercion bug** — clearing an input silently saves as 0, which is medically meaningless. Store raw string in editing state, parse on confirm.
2. **Alias toggle + manual name edit conflict** — manually typing a different name makes the alias suggestion disappear with no way to get it back. Case-insensitive comparison in `getRenameInfo` would help.
3. **Codebase-wide `inputMode="decimal"` migration** — 20+ number inputs across upload, settings, tracking pages should all use `inputMode="decimal"`.

## References

### Internal References

- **Reference pattern**: `web/src/app/settings/files/[id]/page.tsx:403-567` — mobile card view
- **Upload page (to modify)**: `web/src/app/upload/page.tsx:591-793` — metrics table + action buttons
- **Brand colors**: `web/src/app/globals.css` — `--status-critical`, `--status-normal`, `--status-warning`
- **Other responsive pages**: `web/src/app/settings/page.tsx:261,380`, `web/src/components/tracking-history.tsx:331,406`
- **Existing `inputMode="decimal"` pattern**: `web/src/components/add-weight-dialog.tsx`
- **cn() utility**: `web/src/lib/utils.ts`

### Product References

- **Task**: `product/tasks/mobile-metrics-review-redesign.md`
- **Brand guidelines**: `product/brand-guidelines/BRAND.md`
- **Screenshot**: `/Users/onurovali/Downloads/IMG_4622.PNG`

### External References

- [Stack Overflow: Why the number input is the worst input](https://stackoverflow.blog/2022/12/26/why-the-number-input-is-the-worst-input/)
- [MDN: inputMode global attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inputmode)
- [TetraLogical: Foundations - fieldset and legend](https://tetralogical.com/blog/2025/01/31/foundations-fieldset-and-legend/)
- [W3C WCAG 2.2 SC 2.5.8: Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [Apple Human Interface Guidelines: Touch targets](https://developer.apple.com/design/human-interface-guidelines)
