---
title: "fix: Logo consistency — extract ViziAILogo component"
type: fix
status: completed
date: 2026-02-20
deepened: 2026-02-20
---

# fix: Logo consistency — extract ViziAILogo component

## Enhancement Summary

**Deepened on:** 2026-02-20
**Reviewers used:** TypeScript reviewer, Pattern recognition, Code simplicity, React best practices, Architecture strategist

### Key Improvements (from deepening)

1. **Simplified to span-only component** — removed polymorphic Link/button/span branching. Call sites wrap the logo in whatever element they need.
2. **Use `cn()` utility** instead of template literal className concatenation (handles Tailwind conflicts and undefined values).
3. **Header switches to `href="/dashboard"`** instead of `onClick` + `router.push` — better accessibility, prefetching, right-click support.

## Overview

The ViziAI wordmark is rendered inconsistently across the app. The canonical two-tone split ("Vizi" in teal + "AI" in coral) only exists in `header.tsx` as a non-exported local function. The login page and invite page render "ViziAI" as single-color teal text, violating the brand guidelines documented in `product/brand-guidelines/BRAND.md`.

## Problem Statement

| Location         | File                                      | Element    | Two-tone?     | Interactive?         |
| ---------------- | ----------------------------------------- | ---------- | ------------- | -------------------- |
| Header           | `web/src/components/header.tsx:37-53`     | `<button>` | Yes           | Yes (→ `/dashboard`) |
| Login (content)  | `web/src/app/login/page.tsx:58-63`        | `<Link>`   | No (all teal) | Yes (→ `/`)          |
| Login (fallback) | `web/src/app/login/page.tsx:153-154`      | `<h1>`     | No (all teal) | No                   |
| Invite (pending) | `web/src/app/invite/[token]/page.tsx:193` | `<div>`    | No (all teal) | No                   |

Brand guidelines explicitly state: "Vizi" = `text-primary` (teal), "AI" = `text-secondary` (coral) — always split, never single-color.

## Proposed Solution

Extract a **span-only** `ViziAILogo` component into `web/src/components/viziai-logo.tsx`. The component renders the visual mark only — call sites wrap it in the appropriate interactive element (Link, button, or nothing).

### Component API

```tsx
// web/src/components/viziai-logo.tsx

interface ViziAILogoProps {
  className?: string; // size classes (default: "text-xl sm:text-2xl")
}
```

The component is a pure visual element — no href, no onClick, no conditional rendering of different wrapper elements. This keeps it simple and lets the call site decide interactivity.

### Changes by file

#### 1. Create `web/src/components/viziai-logo.tsx`

New file. Named export. Pure visual mark.

```tsx
import { cn } from "@/lib/utils";

interface ViziAILogoProps {
  className?: string;
}

export function ViziAILogo({ className }: ViziAILogoProps): React.ReactElement {
  return (
    <span
      className={cn(
        "font-bold select-none inline-flex items-baseline",
        className,
      )}
    >
      <span className="text-primary">Vizi</span>
      <span className="text-secondary">AI</span>
    </span>
  );
}
```

**Design decisions:**

- `cn()` from `@/lib/utils` (shadcn pattern) instead of template literals — handles Tailwind class conflicts
- No `"use client"` — pure JSX, no hooks, no event handlers
- `inline-flex items-baseline` keeps the two spans aligned
- No hover/focus — those belong on the wrapping interactive element
- `: React.ReactElement` return type matches codebase majority convention

#### 2. Update `web/src/components/header.tsx`

- Delete local `ViziAILogo` function (lines 37-53)
- Add import: `import { ViziAILogo } from "@/components/viziai-logo";`
- Replace the button at line 120 with a `<Link>` wrapping the logo:

```tsx
<Link
  href="/dashboard"
  className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
  aria-label="ViziAI - Ana sayfa"
>
  <ViziAILogo />
</Link>
```

- Delete `handleLogoClick` function (lines 86-88) — no longer needed
- The header already imports from `next/link` (or if not, add the import)

**Why switch from button to Link:** The current `router.push("/dashboard")` inside a `<button>` loses standard anchor behaviors (prefetch, right-click "open in new tab", status bar URL preview). `<Link>` is semantically correct for navigation.

#### 3. Update `web/src/app/login/page.tsx`

**LoginContent (line 57-64):**

Replace:

```tsx
<div className="mb-4">
  <Link
    href="/"
    className="text-3xl font-bold text-primary hover:text-primary/80"
  >
    ViziAI
  </Link>
</div>
```

With:

```tsx
<div className="mb-4">
  <Link href="/" className="hover:opacity-80 transition-opacity">
    <ViziAILogo className="text-3xl" />
  </Link>
</div>
```

**LoginFallback (line 153-155):**

Replace:

```tsx
<div className="mb-4">
  <h1 className="text-3xl font-bold text-primary">ViziAI</h1>
</div>
```

With:

```tsx
<div className="mb-4">
  <ViziAILogo className="text-3xl" />
</div>
```

- Add import: `import { ViziAILogo } from "@/components/viziai-logo";`
- Keep `Link` import (still used in LoginContent)

#### 4. Update `web/src/app/invite/[token]/page.tsx`

**Line 193:**

Replace:

```tsx
<div className="mb-2 text-3xl font-bold text-primary">ViziAI</div>
```

With:

```tsx
<div className="mb-2">
  <ViziAILogo className="text-3xl" />
</div>
```

- Add import: `import { ViziAILogo } from "@/components/viziai-logo";`

## Out of Scope

- Landing page inline text mentions ("Neden ViziAI?", footer copyright) — these are prose, not logo marks
- Onboarding page "ViziAI'ya Hos Geldiniz" — prose mention
- Invite error/status states (not_found, revoked, expired) — no logo shown currently, not part of this fix

## Acceptance Criteria

- [x] `web/src/components/viziai-logo.tsx` exists with named export `ViziAILogo`
- [x] Header renders identically (two-tone, clickable, same size) — now as `<Link>` instead of `<button>`
- [x] Login page renders two-tone wordmark (both LoginContent and LoginFallback)
- [x] Invite page renders two-tone wordmark
- [x] Login logo links to `/` (not `/dashboard`)
- [x] Invite logo is non-interactive (static span)
- [x] LoginFallback logo is non-interactive (static span)
- [ ] No visual regression on any page using the Header component

## References

- Brand guidelines: `product/brand-guidelines/BRAND.md` → Logo → Wordmark section
- Task file: `product/tasks/logo-consistency-audit.md`
- Component conventions: named exports, `web/src/components/` flat structure
- `cn()` utility: `web/src/lib/utils.ts` (shadcn/ui pattern)
