import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { ViziAILogo } from "@/components/viziai-logo";
import { getAllBlogPosts, formatBlogDate, readMinLabel } from "@/lib/blog";
import { locales, bcp47 } from "@/i18n/config";
import type { Locale } from "@/i18n/config";

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

const blogMeta: Record<
  string,
  {
    title: string;
    description: string;
    heading: string;
    empty: string;
  }
> = {
  tr: {
    title: "Blog — ViziAI",
    description: "Kan testi takibi, sağlık analizi ve ViziAI hakkında yazılar.",
    heading: "Blog",
    empty: "Henüz yazı yayınlanmadı.",
  },
  en: {
    title: "Blog — ViziAI",
    description:
      "Articles about blood test tracking, health analysis, and ViziAI.",
    heading: "Blog",
    empty: "No articles published yet.",
  },
  es: {
    title: "Blog — ViziAI",
    description:
      "Artículos sobre seguimiento de análisis de sangre, salud y ViziAI.",
    heading: "Blog",
    empty: "Aún no se han publicado artículos.",
  },
  de: {
    title: "Blog — ViziAI",
    description:
      "Artikel über Blutwerte-Tracking, Gesundheitsanalyse und ViziAI.",
    heading: "Blog",
    empty: "Noch keine Artikel veröffentlicht.",
  },
  fr: {
    title: "Blog — ViziAI",
    description:
      "Articles sur le suivi des analyses de sang, la santé et ViziAI.",
    heading: "Blog",
    empty: "Aucun article publié pour le moment.",
  },
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const meta = blogMeta[locale] ?? blogMeta.en;
  const alternateLanguages: Record<string, string> = {};
  for (const loc of locales) {
    alternateLanguages[bcp47[loc]] = `https://www.viziai.app/${loc}/blog`;
  }

  return {
    title: meta.title,
    description: meta.description,
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
  const meta = blogMeta[locale] ?? blogMeta.en;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">{meta.heading}</h1>

        {posts.length === 0 ? (
          <p className="text-muted-foreground text-lg">{meta.empty}</p>
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

      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} <ViziAILogo className="text-sm" />
          </p>
        </div>
      </footer>
    </div>
  );
}
