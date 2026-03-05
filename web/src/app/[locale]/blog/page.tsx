import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BlogListFilter } from "@/components/blog-list-filter";
import { getAllBlogPosts, formatBlogDate, readMinLabel } from "@/lib/blog";
import { locales, bcp47 } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import { BASE_URL } from "@/lib/constants";

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) return { title: "Not Found" };
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "blog",
  });
  const alternateLanguages: Record<string, string> = {
    "x-default": `${BASE_URL}/en/blog`,
  };
  for (const loc of locales) {
    alternateLanguages[bcp47[loc]] = `${BASE_URL}/${loc}/blog`;
  }

  return {
    title: t("listTitle"),
    description: t("listDescription"),
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog`,
      languages: alternateLanguages,
    },
    openGraph: {
      title: t("listTitle"),
      description: t("listDescription"),
      url: `${BASE_URL}/${locale}/blog`,
      siteName: "ViziAI",
      type: "website",
      locale: bcp47[locale as Locale],
      images: [
        {
          url: `${BASE_URL}/og/blog-${locale}.jpg`,
          width: 1280,
          height: 838,
          alt: t("listTitle"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("listTitle"),
      description: t("listDescription"),
      images: [`${BASE_URL}/og/blog-${locale}.jpg`],
    },
  };
}

export default async function BlogListingPage({ params }: BlogPageProps) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  const posts = getAllBlogPosts(locale);
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "blog",
  });

  const serializedPosts = posts.map((post) => ({
    slug: post.frontmatter.slug,
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    publishedAt: post.frontmatter.publishedAt,
    tags: post.frontmatter.tags,
    author: post.frontmatter.author,
    readingTime: post.readingTime,
    formattedDate: formatBlogDate(post.frontmatter.publishedAt, locale),
  }));

  const translations = {
    articlesBy: t("articlesBy", { author: "{author}" }),
    allPosts: t("allPosts"),
    filterByTag: t("filterByTag"),
    listEmpty: t("listEmpty"),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          {t("listHeading")}
        </h1>

        <Suspense>
          <BlogListFilter
            posts={serializedPosts}
            locale={locale}
            readMinLabel={readMinLabel[locale] ?? readMinLabel.en}
            translations={translations}
          />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
