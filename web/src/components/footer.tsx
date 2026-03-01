"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export function Footer() {
  const locale = useLocale();
  const t = useTranslations("common");

  return (
    <footer className="border-t border-border/60 bg-teal-50/50 dark:bg-teal-950/30 py-6 mt-auto">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              {t("privacyLink")}
            </Link>
            <span className="text-border">|</span>
            <Link
              href={`/${locale}/blog`}
              className="hover:text-foreground transition-colors"
            >
              {t("blog")}
            </Link>
          </div>
          <span className="hidden sm:block text-sm text-muted-foreground/70">
            {t("copyright")}
          </span>
          <div className="flex items-center gap-1">
            <LocaleSwitcher showFullName />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
