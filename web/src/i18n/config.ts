export const locales = ["tr", "en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

export const localeLabels: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  es: "Español",
};

export const bcp47: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-US",
  es: "es-ES",
};
