import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";
import { ViziAILogo } from "@/components/viziai-logo";
import {
  FileText,
  TrendingUp,
  Users,
  ChevronDown,
  Chrome,
  Shield,
  Lock,
  Heart,
  Server,
  Trash2,
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

const TRACK_FEATURES = [
  { icon: TrendingUp, key: "autoUpdate" },
  { icon: Heart, key: "atAGlance" },
  { icon: Users, key: "familyTrends" },
] as const;

const SECURITY_ITEMS = [
  { icon: Server, key: "euServers" },
  { icon: Lock, key: "noPasswords" },
  { icon: Shield, key: "encrypted" },
  { icon: Trash2, key: "rightToDelete" },
] as const;

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
        <section className="bg-primary/5 pb-12 md:pb-16">
          <div className="container mx-auto px-4 pt-16 md:pt-24 max-w-4xl">
            <div className="text-center">
              <ViziAILogo className="text-4xl sm:text-5xl md:text-6xl mb-6 justify-center" />
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
            <div className="mt-12 relative">
              <Image
                src="/dashboard.jpeg"
                alt="ViziAI dashboard showing blood test trends"
                width={1200}
                height={800}
                priority
                loading="eager"
                quality={65}
                sizes="(max-width: 768px) 100vw, 896px"
                className="rounded-xl border border-border shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* How It Works - Numbered Steps */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-none w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText
                      className="h-5 w-5 text-primary"
                      aria-hidden="true"
                    />
                    <h3 className="font-semibold text-lg">
                      {t("benefits.uploadPdf")}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    {t("benefits.uploadPdfDesc")}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-none w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp
                      className="h-5 w-5 text-primary"
                      aria-hidden="true"
                    />
                    <h3 className="font-semibold text-lg">
                      {t("benefits.seeTrends")}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    {t("benefits.seeTrendsDesc")}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-none w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Users
                      className="h-5 w-5 text-primary"
                      aria-hidden="true"
                    />
                    <h3 className="font-semibold text-lg">
                      {t("benefits.familyProfiles")}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    {t("benefits.familyProfilesDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Track Your Values Section */}
        <section className="py-12 md:py-16 bg-primary/5">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                  {t("track.badge")}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  {t("track.title")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t("track.description")}
                </p>
                <ul className="space-y-3">
                  {TRACK_FEATURES.map(({ icon: Icon, key }) => (
                    <li key={key} className="flex items-start gap-3">
                      <Icon
                        className="h-5 w-5 text-primary mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-muted-foreground">
                        {t(`track.features.${key}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="hidden md:block">
                <Image
                  src="/dashboard.jpeg"
                  alt={t("track.imageAlt")}
                  width={640}
                  height={360}
                  className="rounded-lg border border-border shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              {t("security.title")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {SECURITY_ITEMS.map(({ icon: Icon, key }) => (
                <div key={key} className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">
                    {t(`security.${key}.title`)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t(`security.${key}.description`)}
                  </p>
                </div>
              ))}
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
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
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
            <p className="text-muted-foreground mb-6">
              {t("finalCta.subtitle")}
            </p>
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
