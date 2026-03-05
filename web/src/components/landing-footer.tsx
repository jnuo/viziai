import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { staticPages, toLocale } from "@/i18n/config";

export async function LandingFooter() {
  const locale = await getLocale();
  const t = await getTranslations("common");

  return (
    <footer className="border-t border-border/60 bg-teal-50/50 dark:bg-teal-950/30 py-6 mt-auto">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <Link
            href={`/${locale}/${staticPages.privacy[toLocale(locale)]}`}
            className="hover:text-foreground transition-colors"
          >
            {t("privacyLink")}
          </Link>
          <span className="text-border">|</span>
          <Link
            href={`/${locale}/${staticPages.faq[toLocale(locale)]}`}
            className="hover:text-foreground transition-colors"
          >
            {t("faqLink")}
          </Link>
          <span className="text-border">|</span>
          <Link
            href={`/${locale}/blog`}
            className="hover:text-foreground transition-colors"
          >
            {t("blog")}
          </Link>
          <span className="text-border">|</span>
          <LocaleSwitcher showFullName />
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
