import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  getBlogPost,
  getAllBlogPosts,
  getAlternateLocales,
  formatBlogDate,
  readMinLabel,
} from "@/lib/blog";
import { locales, bcp47, localeLabels } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import { BASE_URL } from "@/lib/constants";

interface ArticlePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    const posts = getAllBlogPosts(locale);
    for (const post of posts) {
      params.push({ locale, slug: post.frontmatter.slug });
    }
  }
  return params;
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPost(locale, slug);
  if (!post) return { title: "Not Found" };

  const { frontmatter } = post;
  const alternates = getAlternateLocales(post, locales);
  const canonicalUrl = `${BASE_URL}/${locale}/blog/${slug}`;

  const alternateLanguages: Record<string, string> = {
    [bcp47[locale as Locale]]: canonicalUrl,
  };
  for (const alt of alternates) {
    const altLocale = alt.locale as Locale;
    alternateLanguages[bcp47[altLocale]] =
      `${BASE_URL}/${alt.locale}/blog/${alt.slug}`;
  }
  const enAlt = alternates.find((a) => a.locale === "en");
  if (locale === "en") {
    alternateLanguages["x-default"] = canonicalUrl;
  } else if (enAlt) {
    alternateLanguages["x-default"] = `${BASE_URL}/en/blog/${enAlt.slug}`;
  }

  return {
    title: `${frontmatter.title} — ViziAI`,
    description: frontmatter.description,
    alternates: {
      canonical: canonicalUrl,
      languages: alternateLanguages,
    },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: "article",
      publishedTime: frontmatter.publishedAt,
      tags: frontmatter.tags,
      url: canonicalUrl,
      siteName: "ViziAI",
      locale: bcp47[locale as Locale],
      images: [
        {
          url: `${BASE_URL}/og/blog-${locale}.png`,
          width: 1280,
          height: 838,
          alt: frontmatter.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
      images: [`${BASE_URL}/og/blog-${locale}.png`],
    },
  };
}

export default async function BlogArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  const post = getBlogPost(locale, slug);
  if (!post) notFound();

  const { frontmatter, content, readingTime } = post;
  const alternates = getAlternateLocales(post, locales);
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "blog",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {t("back")}
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {frontmatter.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            {frontmatter.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <time
              dateTime={frontmatter.publishedAt}
              className="flex items-center gap-1.5"
            >
              <Calendar aria-hidden="true" className="h-3.5 w-3.5" />
              {formatBlogDate(frontmatter.publishedAt, locale)}
            </time>
            <span className="flex items-center gap-1.5">
              <Clock aria-hidden="true" className="h-3.5 w-3.5" />
              {readingTime} {readMinLabel[locale] ?? readMinLabel.en}
            </span>
          </div>
          {alternates.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {t("alsoIn")}
              </span>
              {alternates.map((alt) => (
                <Link
                  key={alt.locale}
                  href={`/${alt.locale}/blog/${alt.slug}`}
                  className="text-xs px-3 py-2 min-h-[44px] inline-flex items-center rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  hrefLang={bcp47[alt.locale as Locale]}
                  aria-label={`Read in ${localeLabels[alt.locale as Locale]}`}
                >
                  {localeLabels[alt.locale as Locale]}
                </Link>
              ))}
            </div>
          )}
        </header>

        <article className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary prose-a:underline">
          <MDXRemote source={content} />
        </article>

        <section className="mt-12 p-6 sm:p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
          <h2 className="text-xl font-bold mb-2">{t("ctaHeading")}</h2>
          <p className="text-muted-foreground mb-6">{t("ctaDesc")}</p>
          <Button size="lg" asChild>
            <Link href="/login">{t("ctaButton")}</Link>
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
