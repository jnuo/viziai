import type { MetadataRoute } from "next";
import { locales, bcp47, staticPages } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import { getAllBlogPosts } from "@/lib/blog";

const BASE_URL = "https://www.viziai.app";

/** Next.js calls this to generate a sitemap index at /sitemap.xml */
export async function generateSitemaps() {
  return locales.map((locale) => ({ id: locale }));
}

/** Build hreflang alternates map for a path pattern */
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

export default function sitemap({ id }: { id: string }): MetadataRoute.Sitemap {
  const locale = id as Locale;
  const entries: MetadataRoute.Sitemap = [];

  // Homepage
  entries.push({
    url: `${BASE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
    alternates: {
      languages: localeAlternates((l) => `/${l}`),
    },
  });

  // Blog listing
  entries.push({
    url: `${BASE_URL}/${locale}/blog`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: {
      languages: localeAlternates((l) => `/${l}/blog`),
    },
  });

  // Blog posts for this locale
  const posts = getAllBlogPosts(locale);
  const allSlugs = new Map<string, Map<string, string>>();
  for (const loc of locales) {
    for (const post of getAllBlogPosts(loc)) {
      const { slug, publishedAt } = post.frontmatter;
      if (!allSlugs.has(slug)) allSlugs.set(slug, new Map());
      allSlugs.get(slug)!.set(loc, publishedAt);
    }
  }

  for (const post of posts) {
    const { slug, publishedAt } = post.frontmatter;
    const localeMap = allSlugs.get(slug);
    const languages: Record<string, string> = {};
    if (localeMap) {
      for (const [loc] of localeMap) {
        languages[bcp47[loc as Locale]] = `${BASE_URL}/${loc}/blog/${slug}`;
      }
      if (localeMap.has("en")) {
        languages["x-default"] = `${BASE_URL}/en/blog/${slug}`;
      }
    }

    entries.push({
      url: `${BASE_URL}/${locale}/blog/${slug}`,
      lastModified: new Date(publishedAt),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages },
    });
  }

  // Static pages with translated slugs
  for (const [, slugs] of Object.entries(staticPages)) {
    const languages: Record<string, string> = {};
    for (const loc of locales) {
      languages[bcp47[loc]] = `${BASE_URL}/${loc}/${slugs[loc]}`;
    }
    languages["x-default"] = `${BASE_URL}/en/${slugs.en}`;

    entries.push({
      url: `${BASE_URL}/${locale}/${slugs[locale]}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
      alternates: { languages },
    });
  }

  return entries;
}
