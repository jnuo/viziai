import type { ComponentType } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FaqContent } from "@/app/faq/faq-content";
import { PrivacyContent } from "@/app/privacy/privacy-content";
import { locales, bcp47, staticPages, toLocale } from "@/i18n/config";
import type { Locale, StaticPageId } from "@/i18n/config";
import { BASE_URL } from "@/lib/constants";

const pageComponents: Record<StaticPageId, ComponentType> = {
  privacy: PrivacyContent,
  faq: FaqContent,
};

interface StaticPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

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
  const pageId = resolvePageId(toLocale(locale), slug);
  if (!pageId) return { title: "Not Found" };

  const t = await getTranslations({
    locale: toLocale(locale),
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
    description:
      { privacy: t("intro"), faq: t("subtitle") }[pageId] ?? t("title"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/${slug}`,
      languages: alternateLanguages,
    },
  };
}

const FAQ_KEYS = [
  "whatIsViziAI",
  "howToUpload",
  "enabizImport",
  "dataSecure",
  "familyTracking",
  "isFree",
  "languages",
  "testsAbroad",
  "afterUpload",
  "whoCanSee",
  "deleteData",
  "colorMeaning",
  "referenceRanges",
  "mobileApp",
  "chromeExtension",
] as const;

export default async function StaticPage({ params }: StaticPageProps) {
  const { locale, slug } = await params;
  const pageId = resolvePageId(toLocale(locale), slug);
  if (!pageId) notFound();

  const Component = pageComponents[pageId];

  if (pageId === "faq") {
    const faqT = await getTranslations({
      locale: toLocale(locale),
      namespace: "faq",
    });
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_KEYS.map((key) => ({
        "@type": "Question",
        name: faqT(`questions.${key}.q`),
        acceptedAnswer: {
          "@type": "Answer",
          text: faqT(`questions.${key}.a`),
        },
      })),
    };
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <Component />
      </>
    );
  }

  return <Component />;
}
