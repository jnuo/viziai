import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { locales, localeLabels, staticPages, toLocale } from "@/i18n/config";

const linkClass = "hover:text-foreground transition-colors";

export async function LandingFooter() {
  const rawLocale = await getLocale();
  const locale = toLocale(rawLocale);
  const t = await getTranslations("common");

  const otherLocales = locales.filter((l) => l !== locale);

  return (
    <footer className="border-t border-border/60 bg-teal-50/50 dark:bg-teal-950/30 py-6 mt-auto">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <Link
            href={`/${locale}/${staticPages.privacy[locale]}`}
            className={linkClass}
          >
            {t("privacyLink")}
          </Link>
          <span className="text-border">|</span>
          <Link
            href={`/${locale}/${staticPages.faq[locale]}`}
            className={linkClass}
          >
            {t("faqLink")}
          </Link>
          <span className="text-border">|</span>
          <Link
            href={`/${locale}/${staticPages.enabizGuide[locale]}`}
            className={linkClass}
          >
            {t("enabizGuideLink")}
          </Link>
          <span className="text-border">|</span>
          <Link href={`/${locale}/blog`} className={linkClass}>
            {t("blog")}
          </Link>
          <span className="text-border">|</span>
          <LocaleSwitcher showFullName />
          <span className="text-border">|</span>
          {otherLocales.map((l, i) => (
            <span key={l} className="contents">
              {i > 0 && <span className="text-border">·</span>}
              <Link href={`/${l}`} className={linkClass} hrefLang={l}>
                {localeLabels[l]}
              </Link>
            </span>
          ))}
          <span className="text-border">|</span>
          <ThemeToggle />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-3">
          {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
