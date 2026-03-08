import { NextResponse } from "next/server";
import { locales, bcp47, staticPages } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import { getAllBlogPosts } from "@/lib/blog";

const BASE_URL = "https://www.viziai.app";

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function hreflangs(pathFn: (locale: Locale) => string): string {
  const links = locales
    .map(
      (l) =>
        `    <xhtml:link rel="alternate" hreflang="${bcp47[l]}" href="${escapeXml(`${BASE_URL}${pathFn(l)}`)}" />`,
    )
    .join("\n");
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${BASE_URL}${pathFn("en")}`)}" />`;
  return `${links}\n${xDefault}`;
}

function urlEntry(
  loc: string,
  alternates: string,
  opts: { lastmod?: string; changefreq?: string; priority?: number } = {},
): string {
  const parts = [`    <loc>${escapeXml(loc)}</loc>`, alternates];
  if (opts.lastmod) parts.push(`    <lastmod>${opts.lastmod}</lastmod>`);
  if (opts.changefreq)
    parts.push(`    <changefreq>${opts.changefreq}</changefreq>`);
  if (opts.priority !== undefined)
    parts.push(`    <priority>${opts.priority}</priority>`);
  return `  <url>\n${parts.join("\n")}\n  </url>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale: raw } = await params;
  // Strip .xml extension: "en.xml" → "en"
  const locale = raw.replace(/\.xml$/, "") as Locale;

  if (!locales.includes(locale)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const entries: string[] = [];

  // Homepage
  entries.push(
    urlEntry(
      `${BASE_URL}/${locale}`,
      hreflangs((l) => `/${l}`),
      {
        changefreq: "weekly",
        priority: 1.0,
      },
    ),
  );

  // Blog listing
  entries.push(
    urlEntry(
      `${BASE_URL}/${locale}/blog`,
      hreflangs((l) => `/${l}/blog`),
      {
        changefreq: "weekly",
        priority: 0.8,
      },
    ),
  );

  // Blog posts — cross-link by hreflangGroup when available, else by slug
  const posts = getAllBlogPosts(locale);

  // Build a map of hreflangGroup → { locale → slug }
  const groupMap = new Map<string, Map<string, string>>();
  const slugLocales = new Map<string, Set<string>>();
  for (const loc of locales) {
    for (const post of getAllBlogPosts(loc)) {
      const { slug, hreflangGroup } = post.frontmatter;
      if (hreflangGroup) {
        if (!groupMap.has(hreflangGroup))
          groupMap.set(hreflangGroup, new Map());
        groupMap.get(hreflangGroup)!.set(loc, slug);
      } else {
        if (!slugLocales.has(slug)) slugLocales.set(slug, new Set());
        slugLocales.get(slug)!.add(loc);
      }
    }
  }

  for (const post of posts) {
    const { slug, publishedAt, hreflangGroup } = post.frontmatter;

    let links: string;
    let xDefault = "";

    if (hreflangGroup && groupMap.has(hreflangGroup)) {
      const alternates = groupMap.get(hreflangGroup)!;
      links = [...alternates.entries()]
        .map(
          ([l, s]) =>
            `    <xhtml:link rel="alternate" hreflang="${bcp47[l as Locale]}" href="${escapeXml(`${BASE_URL}/${l}/blog/${s}`)}" />`,
        )
        .join("\n");
      const enSlug = alternates.get("en");
      if (enSlug) {
        xDefault = `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${BASE_URL}/en/blog/${enSlug}`)}" />`;
      }
    } else {
      const available = slugLocales.get(slug) ?? new Set();
      links = [...available]
        .map(
          (l) =>
            `    <xhtml:link rel="alternate" hreflang="${bcp47[l as Locale]}" href="${escapeXml(`${BASE_URL}/${l}/blog/${slug}`)}" />`,
        )
        .join("\n");
      if (available.has("en")) {
        xDefault = `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${BASE_URL}/en/blog/${slug}`)}" />`;
      }
    }

    entries.push(
      urlEntry(`${BASE_URL}/${locale}/blog/${slug}`, links + xDefault, {
        lastmod: new Date(publishedAt).toISOString(),
        changefreq: "monthly",
        priority: 0.7,
      }),
    );
  }

  // Static pages with translated slugs
  for (const [, slugs] of Object.entries(staticPages)) {
    entries.push(
      urlEntry(
        `${BASE_URL}/${locale}/${slugs[locale]}`,
        hreflangs((l) => `/${l}/${slugs[l]}`),
        { changefreq: "monthly", priority: 0.3 },
      ),
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
