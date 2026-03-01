import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Locale } from "@/i18n/config";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

export interface BlogFrontmatter {
  title: string;
  description: string;
  locale: Locale;
  slug: string;
  publishedAt: string;
  tags: string[];
  canonicalLocale?: Locale;
}

export interface BlogPost {
  frontmatter: BlogFrontmatter;
  content: string;
  readingTime: number;
}

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Resolve locale dir with path traversal protection. */
function safeLocaleDir(locale: string): string | null {
  const resolved = path.join(CONTENT_DIR, locale);
  if (
    !resolved.startsWith(CONTENT_DIR + path.sep) &&
    resolved !== CONTENT_DIR
  ) {
    return null;
  }
  return resolved;
}

export function getBlogPost(locale: string, slug: string): BlogPost | null {
  const localeDir = safeLocaleDir(locale);
  if (!localeDir || !fs.existsSync(localeDir)) return null;

  const files = fs.readdirSync(localeDir).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const filePath = path.join(localeDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    if (data.slug === slug) {
      return {
        frontmatter: data as BlogFrontmatter,
        content,
        readingTime: estimateReadingTime(content),
      };
    }
  }

  return null;
}

export function getAllBlogPosts(locale: string): BlogPost[] {
  const localeDir = safeLocaleDir(locale);
  if (!localeDir || !fs.existsSync(localeDir)) return [];

  const files = fs.readdirSync(localeDir).filter((f) => f.endsWith(".mdx"));

  const posts: BlogPost[] = [];
  for (const file of files) {
    const filePath = path.join(localeDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    posts.push({
      frontmatter: data as BlogFrontmatter,
      content,
      readingTime: estimateReadingTime(content),
    });
  }

  // Sort by publishedAt descending
  posts.sort(
    (a, b) =>
      new Date(b.frontmatter.publishedAt).getTime() -
      new Date(a.frontmatter.publishedAt).getTime(),
  );

  return posts;
}

/**
 * Find alternate locale versions of the same article.
 * Looks for articles in other locales that share the same canonicalLocale
 * or are translations of the same article.
 */
export function getAlternateLocales(
  post: BlogPost,
  allLocales: readonly string[],
): { locale: string; slug: string }[] {
  const alternates: { locale: string; slug: string }[] = [];

  for (const loc of allLocales) {
    if (loc === post.frontmatter.locale) continue;

    const localeDir = safeLocaleDir(loc);
    if (!localeDir || !fs.existsSync(localeDir)) continue;

    const files = fs.readdirSync(localeDir).filter((f) => f.endsWith(".mdx"));

    for (const file of files) {
      const filePath = path.join(localeDir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(raw);

      const currentCanonical =
        post.frontmatter.canonicalLocale || post.frontmatter.locale;
      const otherCanonical = data.canonicalLocale || data.locale;

      if (currentCanonical === otherCanonical) {
        alternates.push({ locale: loc, slug: data.slug });
        break;
      }
    }
  }

  return alternates;
}

export function formatBlogDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const readMinLabel: Record<string, string> = {
  tr: "dk okuma",
  en: "min read",
  es: "min de lectura",
  de: "Min. Lesezeit",
  fr: "min de lecture",
};
