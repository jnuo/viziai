import type { MetadataRoute } from "next";
import { locales, bcp47 } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import { getAllBlogPosts } from "@/lib/blog";

const BASE_URL = "https://www.viziai.app";

/** Build hreflang alternates map for a path pattern like `/${locale}` or `/${locale}/blog` */
function localeAlternates(
  pathFn: (locale: string) => string,
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[bcp47[locale]] = `${BASE_URL}${pathFn(locale)}`;
  }
  languages["x-default"] = `${BASE_URL}${pathFn("en")}`;
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Locale homepages — each linked to all other language variants
  for (const locale of locales) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {
        languages: localeAlternates((l) => `/${l}`),
      },
    });
  }

  // Blog listing pages
  for (const locale of locales) {
    entries.push({
      url: `${BASE_URL}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: localeAlternates((l) => `/${l}/blog`),
      },
    });
  }

  // Blog posts — only add alternates for slugs that exist across locales
  const slugsByLocale = new Map<string, Map<string, string>>();
  for (const locale of locales) {
    const posts = getAllBlogPosts(locale);
    for (const post of posts) {
      const { slug, publishedAt } = post.frontmatter;
      if (!slugsByLocale.has(slug)) {
        slugsByLocale.set(slug, new Map());
      }
      slugsByLocale.get(slug)!.set(locale, publishedAt);
    }
  }

  for (const [slug, localeMap] of slugsByLocale) {
    const languages: Record<string, string> = {};
    for (const [locale] of localeMap) {
      languages[bcp47[locale as Locale]] = `${BASE_URL}/${locale}/blog/${slug}`;
    }
    if (localeMap.has("en")) {
      languages["x-default"] = `${BASE_URL}/en/blog/${slug}`;
    }

    for (const [locale, publishedAt] of localeMap) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}`,
        lastModified: new Date(publishedAt),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages },
      });
    }
  }

  // Static pages (no locale prefix)
  entries.push({
    url: `${BASE_URL}/privacy`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.3,
  });

  return entries;
}
