"use server";

import { cookies } from "next/headers";
import { type Locale, locales } from "@/i18n/config";

export async function setLocale(locale: Locale): Promise<void> {
  if (!locales.includes(locale)) return;
  const store = await cookies();
  store.set("locale", locale, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}
