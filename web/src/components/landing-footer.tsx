import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ThemeToggle } from "@/components/theme-toggle";
import { locales, localeLabels, staticPages, toLocale } from "@/i18n/config";
import type { Locale } from "@/i18n/config";

const localeFlags: Record<Locale, string> = {
  tr: "🇹🇷",
  en: "🇬🇧",
  es: "🇪🇸",
  de: "🇩🇪",
  fr: "🇫🇷",
  nl: "🇳🇱",
};

const linkClass =
  "text-muted-foreground hover:text-foreground transition-colors";

export async function LandingFooter() {
  const rawLocale = await getLocale();
  const locale = toLocale(rawLocale);
  const t = await getTranslations("common");

  return (
    <footer className="border-t border-border/60 bg-teal-50/50 dark:bg-teal-950/30 py-10 mt-auto">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 text-sm">
          {/* Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">
              {t("footerProduct")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/${staticPages.enabizGuide[locale]}`}
                  className={linkClass}
                >
                  {t("enabizGuideLink")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/blog`} className={linkClass}>
                  {t("blog")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">
              {t("footerSupport")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/${staticPages.faq[locale]}`}
                  className={linkClass}
                >
                  {t("faqLink")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/${staticPages.privacy[locale]}`}
                  className={linkClass}
                >
                  {t("privacyLink")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Preferences — language + theme */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="font-semibold text-foreground mb-3">
              {t("footerPreferences")}
            </h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-1">
              {locales.map((l) => (
                <li key={l}>
                  <Link
                    href={`/${l}`}
                    hrefLang={l}
                    className={`${linkClass} inline-flex items-center gap-1.5${l === locale ? " text-foreground font-medium" : ""}`}
                  >
                    <span aria-hidden="true">{localeFlags[l]}</span>
                    {localeLabels[l]}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 [&_button]:px-0 [&_button]:h-auto [&_button]:bg-transparent [&_button:hover]:bg-transparent">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border/40 text-sm text-muted-foreground">
          <p>{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
