---
title: "feat: Add resizable metric grid height on desktop"
type: feat
status: completed
date: 2026-02-23
---

# feat: Add resizable metric grid height on desktop

## Overview

The dashboard metric grid has a fixed `max-h-48` (192px). On desktop with 6 columns, only ~2 rows of cards are visible before scrolling. Add a draggable resize handle at the bottom of the grid container so users can adjust the visible height. Desktop only (md+), session-only (no DB persistence).

## Problem Statement

Users with 20+ blood test metrics need to scroll through a narrow 192px window to find and select metrics. The fixed height wastes available screen real estate on desktop monitors where vertical space is abundant.

## Proposed Solution

Add a thin drag handle bar at the bottom edge of the metric grid's scroll container. On mousedown + mousemove, dynamically adjust the container's `maxHeight`. Clamp between 96px (1 row) and the grid's full content height (no scroll needed).

## Technical Approach

### Target Code

`web/src/app/dashboard/page.tsx` — line 870-982:

```tsx
// Current (line 871)
<div className="max-h-48 overflow-y-auto p-2">

// After — desktop uses state-driven height, mobile keeps fixed
<div
  className={cn("overflow-y-auto p-2", !isDesktop && "max-h-48")}
  style={isDesktop ? { maxHeight: gridHeight } : undefined}
  ref={gridContainerRef}
>
```

### Implementation Steps

#### 1. Add state and refs — `web/src/app/dashboard/page.tsx`

```tsx
const DEFAULT_GRID_HEIGHT = 192; // matches max-h-48
const MIN_GRID_HEIGHT = 96; // ~1 card row
const KEYBOARD_STEP = 48; // ~1 row per keypress

const [gridHeight, setGridHeight] = useState(DEFAULT_GRID_HEIGHT);
const gridContainerRef = useRef<HTMLDivElement>(null);
const isDraggingRef = useRef(false);
```

#### 2. Add resize handler — `web/src/app/dashboard/page.tsx`

Custom hook or inline logic for the drag interaction:

- `mousedown` on handle → record `startY` and `startHeight`
- `mousemove` on `document` → compute delta, clamp, update `gridHeight`
- `mouseup` on `document` → cleanup, sync final height
- During drag: set `user-select: none` on body, keep `cursor: ns-resize` globally
- Use `requestAnimationFrame` to throttle updates during drag

#### 3. Add keyboard support — `web/src/app/dashboard/page.tsx`

On the handle element:

- `ArrowDown` → increase height by `KEYBOARD_STEP`
- `ArrowUp` → decrease height by `KEYBOARD_STEP`
- Clamp between min and max (computed from `gridContainerRef.current.scrollHeight`)

#### 4. Add handle element — `web/src/app/dashboard/page.tsx`

Place inside `<CardContent>`, after the scroll container div (after line 982), before `</CardContent>`:

```tsx
{
  /* Resize handle — desktop only */
}
<div
  role="separator"
  aria-orientation="horizontal"
  aria-valuenow={gridHeight}
  aria-valuemin={MIN_GRID_HEIGHT}
  aria-valuemax={maxGridHeight}
  aria-label="Metrik alanını boyutlandır"
  tabIndex={0}
  className={cn(
    "hidden md:flex items-center justify-center",
    "h-2 cursor-row-resize select-none",
    "hover:bg-muted/50 transition-colors",
    "group",
  )}
  onMouseDown={handleResizeStart}
  onKeyDown={handleResizeKeyDown}
>
  <div className="w-8 h-0.5 rounded-full bg-muted-foreground/30 group-hover:bg-muted-foreground/50 transition-colors" />
</div>;
```

#### 5. Auto-clamp on filter changes — `web/src/app/dashboard/page.tsx`

When `displayedMetrics` changes (search filter), clamp `gridHeight` to not exceed the new content height:

```tsx
useEffect(() => {
  if (gridContainerRef.current) {
    const contentHeight = gridContainerRef.current.scrollHeight;
    if (gridHeight > contentHeight && contentHeight >= MIN_GRID_HEIGHT) {
      setGridHeight(contentHeight);
    }
  }
}, [displayedMetrics.length]);
```

#### 6. Responsive guard

- Handle uses `hidden md:flex` — invisible on mobile
- Grid container: on mobile, keep `max-h-48` class; on desktop, use `style={{ maxHeight: gridHeight }}`
- React state (`gridHeight`) survives responsive transitions — if user goes mobile and back to desktop, their height is preserved within the session

### Edge Cases

| Case                                 | Behavior                                                                    |
| ------------------------------------ | --------------------------------------------------------------------------- |
| Few metrics (1 row, no scroll)       | Handle still visible but dragging has no practical effect (min ≈ max)       |
| Search filters reduce content        | Auto-clamp height to content height (no empty space)                        |
| Search cleared, content grows        | Height stays at clamped value; user can re-expand                           |
| Viewport crosses md breakpoint       | Handle hides; mobile uses fixed 192px; desktop restores state height        |
| Page reload                          | Height resets to 192px (session-only)                                       |
| Trackpad scroll momentum near handle | Handle requires explicit mousedown — passive scroll does not trigger resize |
| Text during drag                     | `user-select: none` on body prevents accidental text selection              |

## Acceptance Criteria

- [x] Drag handle visible at bottom of metric grid on desktop (md+ only)
- [x] Mouse drag up/down resizes grid height in real time
- [x] Height clamped between ~96px (1 row) and full content height
- [x] Keyboard: Arrow Up/Down adjusts height by ~48px per press
- [x] ARIA attributes: `role="separator"`, `aria-orientation`, `aria-valuenow/min/max`, `aria-label`
- [x] Handle invisible on mobile — grid keeps fixed `max-h-48`
- [x] No text selection during drag (`user-select: none`)
- [x] Cursor stays `ns-resize` during drag even if mouse drifts off handle
- [x] Height auto-clamps when search filter reduces visible metrics
- [x] No new dependencies added
- [x] Performance: smooth resize with 30+ metrics (use rAF throttling)

## Files to Modify

| File                             | Change                                                         |
| -------------------------------- | -------------------------------------------------------------- |
| `web/src/app/dashboard/page.tsx` | Add resize state, handle element, drag logic, keyboard support |

## Out of Scope

- Persisting height to DB
- Mobile touch resize
- Resizing the chart section
- Double-click to toggle min/max (future enhancement)

## References

- Current grid container: `web/src/app/dashboard/page.tsx:871`
- Existing grip handle pattern: `SortableMetricItem` at `web/src/app/dashboard/page.tsx:156-166`
- Brand guidelines: `product/brand-guidelines/BRAND.md` — handle styling should be subtle, muted colors
- [shadcn/ui Resizable docs](https://ui.shadcn.com/docs/components/radix/resizable) — evaluated but not used (designed for panel splits, not single container resize)
- [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) — flex/grid over JS measurement for layout, avoid unwanted scrollbars
