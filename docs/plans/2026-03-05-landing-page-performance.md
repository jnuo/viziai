# Landing Page Performance Optimization

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring viziai.app mobile PageSpeed from 64 to 90+ by eliminating redirect chains, converting the landing page to a Server Component, and reducing JS shipped to the client.

**Architecture:** Replace the current `"use client"` landing page (which ships 1.33MB JS including Sentry, next-auth, Framer Motion, Radix UI) with a server-rendered page that ships near-zero JS. Eliminate the `/ -> /tr` redirect by using middleware rewrite. Move authenticated-user redirect from client-side `useSession()` to middleware.

**Tech Stack:** Next.js 15 App Router, next-intl v4 (server `getTranslations`), middleware rewrites

---

## Current Problems (PageSpeed Mobile: 64)

1. **Redirect chain** (`/` -> `/tr`) costs ~783ms — `app/page.tsx` does `redirect('/tr')`
2. **Landing page is `"use client"`** — shows blank div during session check, blocks LCP at 5.5s
3. **1.33MB JS bundle** for landing page includes: Sentry (386KB), Framer (169KB), next-auth (57KB), Radix (57KB)
4. **Root layout wraps everything in SessionProvider** — fires `/api/auth/session` fetch even on public pages

## Solution Overview

| Change                           | Impact                              | Effort |
| -------------------------------- | ----------------------------------- | ------ |
| Middleware rewrite for `/`       | Eliminates 783ms redirect           | Small  |
| Auth redirect in middleware      | Removes `useSession()` from landing | Small  |
| Server Component landing page    | Drops ~800KB+ JS, instant LCP       | Medium |
| Lightweight server header/footer | Avoids pulling in auth/Radix        | Small  |

---

### Task 1: Create feature branch

**Step 1:** Create and switch to feature branch

```bash
git checkout -b feature/landing-perf
```

---

### Task 2: Middleware — rewrite `/` and redirect authenticated users

**Files:**

- Modify: `web/src/middleware.ts`
- Delete content from: `web/src/app/page.tsx` (replace with rewrite)

**Context:** Currently `app/page.tsx` reads a cookie and does `redirect('/tr')` which causes a 302. Instead, middleware should rewrite `/` to `/{locale}` transparently (no redirect, no URL change for default locale). Also, authenticated users visiting `/{locale}` should be redirected to `/dashboard` server-side, removing the need for client-side `useSession()` check.

**Step 1:** Update middleware to handle root path rewrite and auth redirect for locale pages

In `web/src/middleware.ts`, add two new blocks BEFORE the existing locale cookie sync:

```typescript
// At the top of the middleware function, BEFORE locale cookie sync:

// 1. Rewrite "/" to "/{locale}" to avoid 302 redirect chain
if (pathname === "/") {
  const localeCookie = request.cookies.get("locale")?.value;
  const locale =
    localeCookie && locales.includes(localeCookie as Locale)
      ? localeCookie
      : "tr";
  return NextResponse.rewrite(new URL(`/${locale}`, request.url));
}

// 2. Redirect authenticated locale homepage visitors to dashboard
const isLocaleHomepage =
  locales.includes(pathname.slice(1) as Locale) &&
  pathname.split("/").length === 2;
if (isLocaleHomepage) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}
```

**Step 2:** Simplify `web/src/app/page.tsx` — keep it as a fallback but it should never be hit now

```typescript
import { redirect } from "next/navigation";

export default function Home() {
  // Fallback — middleware rewrite handles this path normally
  redirect("/tr");
}
```

**Step 3:** Verify locally

```bash
cd web && npm run dev
# Visit http://localhost:3000/ — should show landing page without redirect
# Check Network tab — no 302 redirect to /tr
# Login and visit http://localhost:3000/tr — should redirect to /dashboard
```

**Step 4:** Commit

```bash
git add web/src/middleware.ts web/src/app/page.tsx
git commit -m "perf: eliminate redirect chain with middleware rewrite"
```

---

### Task 3: Create server-rendered landing header

**Files:**

- Create: `web/src/components/landing-header.tsx`

**Context:** The current `Header` component is `"use client"` and imports SessionProvider, profile switcher, blood pressure/weight dialogs, etc. For the landing page, we only need: logo, locale switcher, login button. The locale switcher is the only client component needed.

**Step 1:** Create lightweight server header

```typescript
// web/src/components/landing-header.tsx
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ViziAILogo } from "@/components/viziai-logo";
import { LocaleSwitcher } from "@/components/locale-switcher";

export async function LandingHeader() {
  const t = await getTranslations("components.header");

  return (
    <header className="border-b bg-card">
      <nav
        className="flex items-center justify-between px-3 py-2.5 sm:px-6 md:px-8"
        aria-label={t("mainNav")}
      >
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
          aria-label={t("home")}
        >
          <ViziAILogo />
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <LocaleSwitcher showFullName />
          <Button variant="default" size="sm" asChild>
            <Link href="/login">{t("login")}</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
```

**Step 2:** Commit

```bash
git add web/src/components/landing-header.tsx
git commit -m "perf: add lightweight server-rendered landing header"
```

---

### Task 4: Create server-rendered landing footer

**Files:**

- Create: `web/src/components/landing-footer.tsx`

**Context:** The current `Footer` is `"use client"` with `useLocale()`, `useTranslations()`, and imports LocaleSwitcher + ThemeToggle (both client components with Radix dropdowns). For the landing page, use server `getTranslations` and `getLocale`, keeping LocaleSwitcher and ThemeToggle as the only client islands.

**Step 1:** Create server footer

```typescript
// web/src/components/landing-footer.tsx
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { staticPages, toLocale } from "@/i18n/config";

export async function LandingFooter() {
  const locale = await getLocale();
  const t = await getTranslations("common");

  return (
    <footer className="border-t border-border/60 bg-teal-50/50 dark:bg-teal-950/30 py-6 mt-auto">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <Link
            href={`/${locale}/${staticPages.privacy[toLocale(locale)]}`}
            className="hover:text-foreground transition-colors"
          >
            {t("privacyLink")}
          </Link>
          <span className="text-border">|</span>
          <Link
            href={`/${locale}/${staticPages.faq[toLocale(locale)]}`}
            className="hover:text-foreground transition-colors"
          >
            {t("faqLink")}
          </Link>
          <span className="text-border">|</span>
          <Link
            href={`/${locale}/blog`}
            className="hover:text-foreground transition-colors"
          >
            {t("blog")}
          </Link>
          <span className="text-border">|</span>
          <LocaleSwitcher showFullName />
          <span className="text-border">|</span>
          <ThemeToggle />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-3">
          {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
```

**Step 2:** Commit

```bash
git add web/src/components/landing-footer.tsx
git commit -m "perf: add server-rendered landing footer"
```

---

### Task 5: Convert landing page to Server Component

**Files:**

- Rewrite: `web/src/components/landing-page.tsx`

**Context:** This is the highest-impact change. The current component is `"use client"` with `useSession()`, `useRouter()`, `useTranslations()`. Convert it to an async server component using `getTranslations` from `next-intl/server`. Remove all auth logic (handled by middleware now). Import the new `LandingHeader` and `LandingFooter`. Keep all the same visual structure.

**Key rules:**

- No `"use client"` directive
- Use `getTranslations()` from `next-intl/server` instead of `useTranslations()`
- No `useSession`, `useRouter`, `useEffect`
- Static imports for lucide icons (they work in server components)
- `Image` from `next/image` works in server components
- `Link` from `next/link` works in server components
- `Card`, `Button` from shadcn work in server components
- `<details>` for FAQ (native HTML, no JS)

**Step 1:** Rewrite `landing-page.tsx` as a server component

The component should:

1. Be an `async function` (no "use client")
2. Call `const t = await getTranslations("pages.landing")` and `const faqT = await getTranslations("faq")`
3. Import `LandingHeader` and `LandingFooter` instead of `Header` and `Footer`
4. Remove the `useSession()` check and blank loading div
5. Keep all the same JSX structure (hero, features, how-it-works, social proof, FAQ, CTA)
6. Use `Link` for buttons instead of router.push

**Step 2:** Build and check for errors

```bash
cd web && npm run build
```

Expected: No build errors. The landing page chunk should be dramatically smaller.

**Step 3:** Test locally

```bash
npm run dev
# Visit http://localhost:3000/ — should render instantly with full content
# No blank screen, no loading state
# All sections visible: hero, features, how-it-works, social proof, FAQ, CTA
# FAQ accordion works (native <details>)
# Login button works
# Locale switcher works
```

**Step 4:** Commit

```bash
git add web/src/components/landing-page.tsx
git commit -m "perf: convert landing page to server component

Eliminates ~800KB of client JS (Sentry, next-auth, Framer Motion,
Radix UI) from the landing page bundle. Content now renders on the
server with zero JS needed for initial paint."
```

---

### Task 6: Verify build and run PageSpeed

**Step 1:** Full build check

```bash
cd web && npm run build
```

Expected: Clean build, no errors.

**Step 2:** Check bundle size reduction

```bash
# Compare /[locale]/page chunk count in build output
# Should have fewer chunks than before (was 13 chunks, 1.33MB)
```

**Step 3:** Push and test on staging

```bash
git push -u origin feature/landing-perf
```

Wait for Vercel preview deploy, then run PageSpeed on the staging URL:

```bash
aitools seo pagespeed https://staging.viziai.app --strategy mobile --category performance,seo
aitools seo pagespeed https://staging.viziai.app --strategy desktop --category performance,seo
```

Expected: Mobile performance 85+, ideally 90+. LCP under 3s. No redirect chain.

**Step 4:** If scores are good, commit any final tweaks and create PR.

---

## Expected Results

| Metric             | Before  | Target  |
| ------------------ | ------- | ------- |
| Mobile Performance | 64      | 90+     |
| LCP (mobile)       | 5.5s    | < 2.5s  |
| Speed Index        | 6.4s    | < 3s    |
| TBT                | 350ms   | < 200ms |
| Redirect penalty   | 783ms   | 0ms     |
| JS shipped         | ~1.33MB | < 300KB |
