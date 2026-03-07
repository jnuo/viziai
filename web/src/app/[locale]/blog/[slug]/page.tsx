import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Calendar, Clock, ArrowLeft, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  getBlogPost,
  getAllBlogPosts,
  formatBlogDate,
  readMinLabel,
  slugifyAuthor,
  extractFaqFromContent,
  extractHeadings,
  slugifyHeading,
} from "@/lib/blog";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { locales, bcp47 } from "@/i18n/config";
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
  if (!locales.includes(locale as Locale)) return { title: "Not Found" };
  const post = getBlogPost(locale, slug);
  if (!post) return { title: "Not Found" };

  const { frontmatter } = post;
  const canonicalUrl = `${BASE_URL}/${locale}/blog/${slug}`;

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    alternates: {
      canonical: canonicalUrl,
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
          url: `${BASE_URL}/og/blog-${locale}.jpg`,
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
      images: [`${BASE_URL}/og/blog-${locale}.jpg`],
    },
  };
}

export default async function BlogArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  const post = getBlogPost(locale, slug);
  if (!post) notFound();

  const { frontmatter, content, readingTime } = post;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "blog",
  });

  const canonicalUrl = `${BASE_URL}/${locale}/blog/${slug}`;

  // BlogPosting JSON-LD
  const blogPostingJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.publishedAt,
    dateModified: frontmatter.publishedAt,
    author: {
      "@type": "Person",
      name: frontmatter.author?.name ?? "Onur O.",
    },
    publisher: {
      "@type": "Organization",
      name: "ViziAI",
      url: BASE_URL,
    },
    image: `${BASE_URL}/og/blog-${locale}.jpg`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    inLanguage: bcp47[locale as Locale],
  };

  const headings = extractHeadings(content);

  // Custom MDX components to inject id attributes on headings
  const mdxComponents = {
    h2: (props: React.ComponentProps<"h2">) => {
      const text =
        typeof props.children === "string"
          ? props.children
          : String(props.children);
      return <h2 id={slugifyHeading(text)} {...props} />;
    },
    h3: (props: React.ComponentProps<"h3">) => {
      const text =
        typeof props.children === "string"
          ? props.children
          : String(props.children);
      return <h3 id={slugifyHeading(text)} {...props} />;
    },
  };

  // FAQPage JSON-LD (only if the post has FAQ content)
  const faqPairs = extractFaqFromContent(content);
  let faqJsonLd: Record<string, unknown> | null = null;
  if (faqPairs.length > 0) {
    faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqPairs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostingJsonLd),
        }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd),
          }}
        />
      )}

      <main className="container mx-auto px-4 py-12 max-w-3xl xl:max-w-6xl">
        <div className="xl:grid xl:grid-cols-[1fr_220px] xl:gap-10">
          <div className="max-w-3xl">
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
                {frontmatter.author && (
                  <Link
                    href={`/${locale}/blog?author=${slugifyAuthor(frontmatter.author.name)}`}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <User aria-hidden="true" className="h-3.5 w-3.5" />
                    {frontmatter.author.name}
                  </Link>
                )}
              </div>
            </header>

            <article className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary prose-a:underline">
              <MDXRemote source={content} components={mdxComponents} />
            </article>

            <section className="mt-12 p-6 sm:p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
              <h2 className="text-xl font-bold mb-2">{t("ctaHeading")}</h2>
              <p className="text-muted-foreground mb-6">{t("ctaDesc")}</p>
              <Button size="lg" asChild>
                <Link href="/login">{t("ctaButton")}</Link>
              </Button>
            </section>
          </div>

          {headings.length > 0 && (
            <aside className="hidden xl:block pt-48">
              <TableOfContents headings={headings} />
            </aside>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
