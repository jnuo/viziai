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
