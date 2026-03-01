/**
 * Path-based locale layout for SEO content (blog).
 *
 * IMPORTANT: This [locale] dynamic segment captures any single-segment path
 * (e.g., /en/..., /de/...). Static routes like /dashboard, /login take
 * precedence, but any NEW top-level route must be defined as a static segment
 * to avoid being captured here and returning 404.
 */
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  return <>{children}</>;
}
