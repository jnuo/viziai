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
  author?: { name: string; email: string };
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

/** Rejects path traversal (e.g. locale = "../../etc"). */
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

  posts.sort(
    (a, b) =>
      new Date(b.frontmatter.publishedAt).getTime() -
      new Date(a.frontmatter.publishedAt).getTime(),
  );

  return posts;
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

/**
 * Extract FAQ Q&A pairs from blog MDX content.
 * Looks for an H2 containing "Soru" / "FAQ" / "Questions" followed by
 * H3 questions, each with the paragraph(s) below as the answer.
 */
export interface FaqPair {
  question: string;
  answer: string;
}

export function extractFaqFromContent(content: string): FaqPair[] {
  const lines = content.split("\n");
  const faqPairs: FaqPair[] = [];

  let inFaqSection = false;
  let currentQuestion: string | null = null;
  let currentAnswerLines: string[] = [];

  const faqHeadingPattern = /soru|faq|question|frequently/i;

  for (const line of lines) {
    // Detect H2 headings
    if (line.startsWith("## ")) {
      if (inFaqSection) {
        // Hit the next H2 after FAQ section — flush & stop
        if (currentQuestion) {
          faqPairs.push({
            question: currentQuestion,
            answer: currentAnswerLines.join(" ").trim(),
          });
        }
        break;
      }
      if (faqHeadingPattern.test(line)) {
        inFaqSection = true;
      }
      continue;
    }

    if (!inFaqSection) continue;

    // Detect H3 headings (questions)
    if (line.startsWith("### ")) {
      if (currentQuestion) {
        faqPairs.push({
          question: currentQuestion,
          answer: currentAnswerLines.join(" ").trim(),
        });
      }
      currentQuestion = line.replace(/^###\s+/, "");
      currentAnswerLines = [];
      continue;
    }

    // Accumulate answer text (skip empty lines and horizontal rules)
    const trimmed = line.trim();
    if (trimmed && trimmed !== "---" && currentQuestion) {
      // Strip markdown links but keep text: [text](/url) -> text
      const cleaned = trimmed.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      currentAnswerLines.push(cleaned);
    }
  }

  // Flush last Q&A if content ended inside FAQ section
  if (currentQuestion && currentAnswerLines.length > 0) {
    faqPairs.push({
      question: currentQuestion,
      answer: currentAnswerLines.join(" ").trim(),
    });
  }

  return faqPairs;
}

// --- Table of Contents utilities ---

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  for (const line of content.split("\n")) {
    const m3 = line.match(/^###\s+(.+)/);
    if (m3) {
      headings.push({ id: slugifyHeading(m3[1]), text: m3[1], level: 3 });
      continue;
    }
    const m2 = line.match(/^##\s+(.+)/);
    if (m2) {
      headings.push({ id: slugifyHeading(m2[1]), text: m2[1], level: 2 });
    }
  }
  return headings;
}

export { slugifyAuthor } from "./blog-utils";
