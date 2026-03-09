import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ViziAILogo } from "@/components/viziai-logo";
import { LocaleSwitcher } from "@/components/locale-switcher";

export async function LandingHeader() {
  const t = await getTranslations("components.header");

  return (
    <header className="border-b bg-card">
      <nav
        className="flex items-center justify-between px-3 py-2.5 sm:px-6 md:px-8"
        aria-label={t("mainNav")}
      >
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
          aria-label={t("home")}
        >
          <ViziAILogo className="text-lg sm:text-xl" />
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <LocaleSwitcher showFullName />
          <Button variant="default" size="sm" asChild>
            <Link href="/login">{t("login")}</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
