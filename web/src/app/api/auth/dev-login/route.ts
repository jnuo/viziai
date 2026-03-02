import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hkdfSync } from "crypto";
import { EncryptJWT } from "jose";

/**
 * Dev-only auto-login route.
 * GET /api/auth/dev-login → sets session cookie → redirects to dashboard.
 *
 * Uses the first user in the DB (or specify ?email=... to pick a specific user).
 * ONLY works in development — returns 404 in production.
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const email =
    searchParams.get("email") ||
    process.env.DEV_LOGIN_EMAIL ||
    "onurovalii@gmail.com";
  const redirect = searchParams.get("redirect") || "/dashboard";

  // Find user by email
  const users =
    await sql`SELECT id, email, name FROM users WHERE email = ${email} LIMIT 1`;

  if (users.length === 0) {
    return NextResponse.json(
      { error: "No users found. Sign in with Google first to create a user." },
      { status: 404 },
    );
  }

  const user = users[0];

  // Find first profile this user has access to
  const profiles = await sql`
    SELECT profile_id FROM user_access
    WHERE user_id_new = ${user.id}
    ORDER BY access_level ASC
    LIMIT 1
  `;

  // Create encrypted session cookie (same as NextAuth v4 format)
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "NEXTAUTH_SECRET not set" },
      { status: 500 },
    );
  }

  const encryptionKey = new Uint8Array(
    hkdfSync("sha256", secret, "", "NextAuth.js Generated Encryption Key", 32),
  );

  const maxAge = 30 * 24 * 60 * 60; // 30 days
  const now = Math.floor(Date.now() / 1000);

  const token = await new EncryptJWT({
    sub: user.id,
    dbId: user.id,
    email: user.email,
    name: user.name,
    jti: crypto.randomUUID(),
  })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(now + maxAge)
    .encrypt(encryptionKey);

  const response = NextResponse.redirect(new URL(redirect, request.url));

  // Set session cookie
  response.cookies.set("next-auth.session-token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  // Set active profile cookie if user has a profile
  if (profiles.length > 0) {
    response.cookies.set("viziai_active_profile", profiles[0].profile_id, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge,
    });
  }

  console.log(
    `[dev-login] Logged in as ${user.email} (${user.id})${profiles.length > 0 ? `, profile: ${profiles[0].profile_id}` : ""}`,
  );

  return response;
}
