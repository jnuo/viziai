import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { locales, defaultLocale, staticPages } from "@/i18n/config";
import type { Locale } from "@/i18n/config";

export default async function PrivacyRedirect() {
  const store = await cookies();
  const raw = store.get("locale")?.value;
  const locale: Locale = hasLocale(locales, raw) ? raw : defaultLocale;
  redirect(`/${locale}/${staticPages.privacy[locale]}`);
}
