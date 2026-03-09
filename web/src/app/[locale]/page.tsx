import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing-page";
import { locales, bcp47, toLocale } from "@/i18n/config";
import { BASE_URL } from "@/lib/constants";

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
  const loc = toLocale(locale);
  if (!locales.includes(loc)) return { title: "Not Found" };

  const t = await getTranslations({ locale: loc, namespace: "seo" });
  const title = t("landingTitle");
  const description = t("landingDescription");
  const ogImage = `${BASE_URL}/og/home-${locale}.jpg`;

  const alternateLanguages: Record<string, string> = {
    "x-default": `${BASE_URL}/en`,
  };
  for (const l of locales) {
    alternateLanguages[bcp47[l]] = `${BASE_URL}/${l}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: alternateLanguages,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}`,
      siteName: "ViziAI",
      type: "website",
      locale: bcp47[loc],
      images: [
        { url: ogImage, width: 1280, height: 838, alt: t("ogImageAlt") },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function LocaleHomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const loc = toLocale(locale);
  if (!locales.includes(loc)) notFound();

  const t = await getTranslations({ locale: loc, namespace: "seo" });

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ViziAI",
    url: BASE_URL,
    logo: `${BASE_URL}/icon-512.png`,
    description: t("landingDescription"),
    sameAs: [
      "https://www.linkedin.com/company/viziai",
      "https://x.com/viziai_app",
      "https://github.com/jnuo/viziai",
    ],
    knowsAbout: [
      "Blood test analysis",
      "Health tracking",
      "e-Nabız integration",
      "Lab result interpretation",
      "Biomarker trend analysis",
    ],
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ViziAI",
    url: BASE_URL,
    inLanguage: bcp47[loc],
    description: t("landingDescription"),
    publisher: { "@id": BASE_URL },
  };

  // TODO: Add SoftwareApplication schema when real reviews/ratings exist (#111)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <LandingPage />
    </>
  );
}
