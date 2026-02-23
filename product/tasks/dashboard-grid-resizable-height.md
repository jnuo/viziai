# Task: Dashboard Grid — Resizable Height (Desktop)

**Status:** Pending
**Priority:** Low
**Created:** 2026-02-23

---

## Problem

The metric grid on the dashboard has a fixed `max-h-48` (192px). On desktop with 6 columns, only ~2 rows of cards are visible before the user needs to scroll. Users may want to see more (or fewer) cards at once without scrolling.

## Solution

Add a draggable resize handle at the bottom edge of the metric grid container. Desktop only (md+ breakpoints). Session-only — no persistence to DB.

## Scope

- **Desktop only** — drag handle visible on `md:` and above. Mobile keeps `max-h-48` unchanged.
- **Min height:** 1 card row (~96px)
- **Max height:** all cards visible (remove scroll)
- **No persistence** — resets to default `max-h-48` on page reload

## Implementation Notes

### Current code

`web/src/app/dashboard/page.tsx` line 871:

```html
<div className="max-h-48 overflow-y-auto p-2"></div>
```

### Approach

1. Replace the fixed `max-h-48` with a state-driven `style={{ maxHeight }}` on desktop
2. Add a thin drag handle bar (`4px` tall, full width) below the grid container
3. On `mousedown` → track `clientY` delta → update `maxHeight` state
4. Clamp between min (~96px) and max (scrollHeight of grid content)
5. On mobile, keep `max-h-48` class (no handle rendered)

### Handle design

- Thin horizontal bar with a subtle grip indicator (3 dots or a line)
- `cursor: ns-resize` on hover
- Light border-top to separate from grid content
- Match muted-foreground color for the grip indicator

### Accessibility

- Handle should be keyboard-accessible (Tab to focus, Arrow Up/Down to resize)
- `role="separator"` with `aria-orientation="horizontal"` and `aria-valuenow`

## Out of scope

- Persisting height preference to DB
- Mobile touch resize
- Resizing the chart section
