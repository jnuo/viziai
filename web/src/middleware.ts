import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { locales } from "@/i18n/config";
import type { Locale } from "@/i18n/config";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rewrite "/" to "/{locale}" to avoid 302 redirect chain (saves ~783ms on mobile)
  if (pathname === "/") {
    const localeCookie = request.cookies.get("locale")?.value;
    const locale =
      localeCookie && locales.includes(localeCookie as Locale)
        ? localeCookie
        : "tr";
    return NextResponse.rewrite(new URL(`/${locale}`, request.url));
  }

  // Redirect authenticated locale homepage visitors to dashboard (server-side)
  // This replaces the client-side useSession() check in the landing page
  const isLocaleHomepage = locales.some((l) => pathname === `/${l}`);
  if (isLocaleHomepage) {
    const hasSessionCookie =
      request.cookies.has("next-auth.session-token") ||
      request.cookies.has("__Secure-next-auth.session-token");
    if (hasSessionCookie) {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // Sync locale cookie when visiting /{locale} homepage or /{locale}/blog/*
  const firstSegment = pathname.split("/")[1];
  if (firstSegment && locales.includes(firstSegment as Locale)) {
    const currentCookie = request.cookies.get("locale")?.value;
    if (currentCookie !== firstSegment) {
      const response = NextResponse.next();
      response.cookies.set("locale", firstSegment, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
      return response;
    }
  }

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/upload",
    "/onboarding",
    "/import",
    "/settings",
  ];
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Auth routes (login page) - redirect to dashboard if already logged in
  const authRoutes = ["/login"];
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Protected API routes
  const protectedApiRoutes: string[] = [
    "/api/metrics",
    "/api/metric-order",
    "/api/profiles",
    "/api/upload",
    "/api/onboarding",
    "/api/settings",
  ];

  // Routes that use their own auth (API key, server-to-server, etc.)
  const isSelfAuthRoute =
    pathname.endsWith("/extract/worker") ||
    pathname === "/api/settings/api-keys/verify";
  const isProtectedApiRoute = protectedApiRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Onboarding-related paths that should not trigger the onboarding check
  const onboardingPaths = ["/onboarding", "/api/profiles", "/api/onboarding"];
  const isOnboardingPath = onboardingPaths.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Only call getToken() when we actually need auth info (protected/auth/API routes)
  // This avoids ~350ms of JWT verification on public pages (homepage, blog, FAQ)
  const needsAuth =
    isProtectedRoute ||
    isAuthRoute ||
    (isProtectedApiRoute && !isSelfAuthRoute);
  let isAuthenticated = false;
  if (needsAuth) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    isAuthenticated = !!token;
  }

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL("/login", request.url);
    // Save the intended destination for post-login redirect
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users from login page to dashboard
  if (isAuthRoute && isAuthenticated) {
    // Check if there's a redirect param to honor (must be relative path)
    const redirectTo = request.nextUrl.searchParams.get("redirect");
    const destination =
      redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
        ? redirectTo
        : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Return 401 for protected API routes if not authenticated
  // Skip auth check for internal worker routes
  if (isProtectedApiRoute && !isAuthenticated && !isSelfAuthRoute) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  // For authenticated users on protected routes (except onboarding-related),
  // check if they need onboarding by looking at a cookie
  // Note: We can't make DB calls in middleware, so we use a cookie set by the client
  if (isAuthenticated && isProtectedRoute && !isOnboardingPath) {
    const needsOnboarding = request.cookies.get("viziai_needs_onboarding");
    if (needsOnboarding?.value === "true") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - api/auth (NextAuth routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/auth).*)",
  ],
};
