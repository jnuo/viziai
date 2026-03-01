import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { locales, bcp47, staticPages } from "@/i18n/config";
import type { Locale, StaticPageId } from "@/i18n/config";
import type { ComponentType } from "react";
import { PrivacyContent } from "@/app/privacy/privacy-content";
import { BASE_URL } from "@/lib/constants";

/** Adding a page to staticPages without a renderer here = type error */
const pageComponents: Record<StaticPageId, ComponentType> = {
  privacy: PrivacyContent,
};

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
    description: t("title"),
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

  const Component = pageComponents[pageId];
  return <Component />;
}
