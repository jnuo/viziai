import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing-page";
import { locales, bcp47 } from "@/i18n/config";
import type { Locale } from "@/i18n/config";

const BASE_URL = "https://www.viziai.app";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "seo",
  });

  const alternateLanguages: Record<string, string> = {
    "x-default": `${BASE_URL}/en`,
  };
  for (const loc of locales) {
    alternateLanguages[bcp47[loc]] = `${BASE_URL}/${loc}`;
  }

  return {
    title: t("landingTitle"),
    description: t("landingDescription"),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: alternateLanguages,
    },
    openGraph: {
      title: t("landingTitle"),
      description: t("landingDescription"),
      url: `${BASE_URL}/${locale}`,
      siteName: t("siteTitle"),
      type: "website",
      locale: bcp47[locale as Locale],
      images: [
        {
          url: `${BASE_URL}/dashboard.jpeg`,
          width: 1280,
          height: 838,
          alt: t("ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("landingTitle"),
      description: t("landingDescription"),
      images: [`${BASE_URL}/dashboard.jpeg`],
    },
  };
}

export default async function LocaleHomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "seo",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ViziAI",
    url: `${BASE_URL}/${locale}`,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    inLanguage: bcp47[locale as Locale],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: t("landingDescription"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
