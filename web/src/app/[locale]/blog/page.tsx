import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getAllBlogPosts, formatBlogDate, readMinLabel } from "@/lib/blog";
import { locales, bcp47 } from "@/i18n/config";
import type { Locale } from "@/i18n/config";

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
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "blog",
  });
  const alternateLanguages: Record<string, string> = {
    "x-default": "https://www.viziai.app/en/blog",
  };
  for (const loc of locales) {
    alternateLanguages[bcp47[loc]] = `https://www.viziai.app/${loc}/blog`;
  }

  return {
    title: t("listTitle"),
    description: t("listDescription"),
    alternates: {
      canonical: `https://www.viziai.app/${locale}/blog`,
      languages: alternateLanguages,
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          {t("listHeading")}
        </h1>

        {posts.length === 0 ? (
          <p className="text-muted-foreground text-lg">{t("listEmpty")}</p>
        ) : (
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.frontmatter.slug}>
                <Link
                  href={`/${locale}/blog/${post.frontmatter.slug}`}
                  className="block group"
                >
                  <Card className="transition-shadow duration-200 group-hover:shadow-lg border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {post.frontmatter.title}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {post.frontmatter.tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-3">
                        {post.frontmatter.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <time
                          dateTime={post.frontmatter.publishedAt}
                          className="flex items-center gap-1.5"
                        >
                          <Calendar
                            aria-hidden="true"
                            className="h-3.5 w-3.5"
                          />
                          {formatBlogDate(post.frontmatter.publishedAt, locale)}
                        </time>
                        <span className="flex items-center gap-1.5">
                          <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                          {post.readingTime}{" "}
                          {readMinLabel[locale] ?? readMinLabel.en}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Footer />
    </div>
  );
}
