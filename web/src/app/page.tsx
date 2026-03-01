import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LandingPage } from "@/components/landing-page";

const BASE_URL = "https://www.viziai.app";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("seo");
  return {
    title: t("landingTitle"),
    description: t("landingDescription"),
    openGraph: {
      title: t("landingTitle"),
      description: t("landingDescription"),
      url: BASE_URL,
      siteName: t("siteTitle"),
      type: "website",
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

export default async function Home(): Promise<React.ReactElement> {
  const t = await getTranslations("seo");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ViziAI",
    url: BASE_URL,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
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
