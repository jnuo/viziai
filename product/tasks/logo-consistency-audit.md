# Task: Logo Consistency Audit

**Status:** Pending
**Priority:** Low
**Created:** 2026-02-20

---

## Problem

The logo is not used consistently across the app. The canonical `ViziAILogo` component in `header.tsx` renders a two-part text mark ("Vizi" in teal + "AI" in coral), but guest-facing pages use plain single-color text instead.

## Canonical implementation

`web/src/components/header.tsx` lines 37-53 — `ViziAILogo()` component:

- "Vizi" in `text-primary` (teal), "AI" in `text-secondary` (coral)
- Clickable, links to `/dashboard`
- Hover transitions, focus states

## Pages using it correctly

- `/dashboard` — via `<Header>`
- `/upload` — via `<Header>`
- `/settings` — via `<Header>`
- `/onboarding` — via `<Header>`
- `/` (home) — via `<Header>`

## Inconsistencies

### Login page (`web/src/app/login/page.tsx`)

- **Line ~62:** `<Link>` with `text-3xl font-bold text-primary` — single teal color, no coral "AI" split
- **Line ~154:** Fallback `<h1>` with same single-color styling
- Neither uses the `ViziAILogo` component

### Invite claim page (`web/src/app/invite/[token]/page.tsx`)

- **Line ~193:** `<div>` with `text-3xl font-bold text-primary` — static text, single color, not clickable
- Does not use the `ViziAILogo` component

## What's needed

- [x] Extract `ViziAILogo` into a standalone reusable component (or export it from `header.tsx`)
- [x] Replace login page inline text with the logo component
- [x] Replace invite page inline text with the logo component
- [ ] Verify both pages render the two-part teal+coral styling
