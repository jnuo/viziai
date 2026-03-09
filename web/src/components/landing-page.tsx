import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";
import {
  FileText,
  TrendingUp,
  Users,
  ChevronDown,
  Chrome,
  Shield,
  Lock,
  Heart,
} from "lucide-react";
import { CHROME_EXTENSION_URL } from "@/lib/constants";
import { staticPages, toLocale } from "@/i18n/config";

const LANDING_FAQ_KEYS = [
  "whatIsViziAI",
  "howToUpload",
  "enabizImport",
  "dataSecure",
  "familyTracking",
  "isFree",
] as const;

const RICH_FAQ_KEYS = new Set(["enabizImport"]);

const LINK_CLASS =
  "text-primary underline underline-offset-2 hover:text-primary/80 transition-colors";

export async function LandingPage(): Promise<React.ReactElement> {
  const locale = await getLocale();
  const t = await getTranslations("pages.landing");
  const faqT = await getTranslations("faq");
  const guideSlug = staticPages.enabizGuide[toLocale(locale)];

  const richTags = {
    cws: (chunks: React.ReactNode) => (
      <a
        href={CHROME_EXTENSION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK_CLASS}
      >
        {chunks}
      </a>
    ),
    guide: (chunks: React.ReactNode) => (
      <a href={`/${locale}/${guideSlug}`} className={LINK_CLASS}>
        {chunks}
      </a>
    ),
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

          <div className="container relative mx-auto px-4 py-16 md:py-24 max-w-3xl">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                {t("heroTitle")}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t("heroDescription")}
              </p>
              <Button
                size="lg"
                asChild
                className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                <Link href="/login">{t("getStartedFree")}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works - Numbered Steps */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-none w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h3 className="font-semibold text-lg">{t("benefits.uploadPdf")}</h3>
                  </div>
                  <p className="text-muted-foreground">{t("benefits.uploadPdfDesc")}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-none w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h3 className="font-semibold text-lg">{t("benefits.seeTrends")}</h3>
                  </div>
                  <p className="text-muted-foreground">{t("benefits.seeTrendsDesc")}</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-none w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h3 className="font-semibold text-lg">{t("benefits.familyProfiles")}</h3>
                  </div>
                  <p className="text-muted-foreground">{t("benefits.familyProfilesDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* e-Nabız Integration - Full width banner */}
        <section className="py-12 md:py-16 bg-primary/5 border-y border-primary/10">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Chrome className="h-4 w-4" aria-hidden="true" />
                  {t("enabiz.badge")}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  {t("enabiz.title")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t("enabiz.description")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" asChild>
                    <a
                      href={CHROME_EXTENSION_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Chrome className="h-5 w-5 mr-2" aria-hidden="true" />
                      {t("enabiz.cta")}
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link
                      href={`/${locale}/${staticPages.enabizGuide[toLocale(locale)]}`}
                    >
                      {t("enabiz.howItWorks")}
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="hidden md:block">
                <Image
                  src="/guide-send-button.png"
                  alt="e-Nabız Tahlillerim page with Send to ViziAI button"
                  width={640}
                  height={360}
                  className="rounded-lg border border-border shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges - Horizontal pills */}
        <section className="py-8 md:py-10">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex flex-wrap justify-center gap-3 md:gap-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
                <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-medium">{t("trust.encrypted")}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
                <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-medium">{t("trust.private")}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
                <Heart className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-medium">{t("trust.free")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              {t("faq.title")}
            </h2>
            <div className="space-y-3">
              {LANDING_FAQ_KEYS.map((key) => (
                <details
                  key={key}
                  className="group rounded-lg border border-border bg-card"
                >
                  <summary className="cursor-pointer select-none px-5 py-4 font-medium flex items-center justify-between gap-2 hover:bg-muted/50 transition-colors rounded-lg">
                    {faqT(`questions.${key}.q`)}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="px-5 pb-4 text-muted-foreground leading-relaxed">
                    {RICH_FAQ_KEYS.has(key)
                      ? faqT.rich(`questions.${key}.a`, richTags)
                      : faqT(`questions.${key}.a`)}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("finalCta.title")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("finalCta.subtitle")}</p>
            <Button
              size="lg"
              asChild
              className="px-8 py-6 text-lg font-semibold"
            >
              <Link href="/login">{t("getStartedFree")}</Link>
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
