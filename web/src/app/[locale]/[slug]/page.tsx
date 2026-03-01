import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { locales, bcp47, staticPages } from "@/i18n/config";
import type { Locale, StaticPageId } from "@/i18n/config";
import { PrivacyContent } from "@/app/privacy/privacy-content";

const BASE_URL = "https://www.viziai.app";

interface StaticPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/** Resolve slug → page ID for a given locale */
function resolvePageId(locale: Locale, slug: string): StaticPageId | null {
  for (const [pageId, slugs] of Object.entries(staticPages)) {
    if (slugs[locale] === slug) return pageId as StaticPageId;
  }
  return null;
}

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const slugs of Object.values(staticPages)) {
      params.push({ locale, slug: slugs[locale] });
    }
  }
  return params;
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: StaticPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const pageId = resolvePageId(locale as Locale, slug);
  if (!pageId) return { title: "Not Found" };

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: pageId,
  });

  const alternateLanguages: Record<string, string> = {};
  for (const loc of locales) {
    alternateLanguages[bcp47[loc]] =
      `${BASE_URL}/${loc}/${staticPages[pageId][loc]}`;
  }
  alternateLanguages["x-default"] = `${BASE_URL}/en/${staticPages[pageId].en}`;

  return {
    title: t("title"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/${slug}`,
      languages: alternateLanguages,
    },
  };
}

export default async function StaticPage({ params }: StaticPageProps) {
  const { locale, slug } = await params;
  const pageId = resolvePageId(locale as Locale, slug);
  if (!pageId) notFound();

  if (pageId === "privacy") {
    return <PrivacyContent />;
  }

  notFound();
}
