export const locales = ["tr", "en", "es", "de", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

export const localeLabels: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  es: "Español",
  de: "Deutsch",
  fr: "Français",
};

export const bcp47: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-US",
  es: "es-ES",
  de: "de-DE",
  fr: "fr-FR",
};

/**
 * Static page slugs — translated per locale.
 * Key = internal page ID, value = URL slug per locale.
 * Used by [locale]/[slug]/page.tsx and sitemap generation.
 */
export const staticPages = {
  privacy: {
    tr: "gizlilik",
    en: "privacy",
    es: "privacidad",
    de: "datenschutz",
    fr: "confidentialite",
  },
} as const;

export type StaticPageId = keyof typeof staticPages;

// Guard: translated slugs must not collide with static route segments
const RESERVED_SLUGS = ["blog"] as const;
for (const [pageId, slugs] of Object.entries(staticPages)) {
  for (const [locale, slug] of Object.entries(slugs)) {
    if ((RESERVED_SLUGS as readonly string[]).includes(slug)) {
      throw new Error(
        `staticPages["${pageId}"]["${locale}"] = "${slug}" collides with reserved route`,
      );
    }
  }
}
