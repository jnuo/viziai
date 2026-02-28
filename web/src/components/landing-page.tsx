"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { ViziAILogo } from "@/components/viziai-logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import {
  FileText,
  BarChart3,
  Shield,
  Zap,
  Upload,
  Sparkles,
  TrendingUp,
  Users,
  LucideIcon,
} from "lucide-react";

const COLOR_MAP = {
  primary: {
    border: "border-l-primary",
    bg: "bg-primary/10",
    text: "text-primary",
  },
  secondary: {
    border: "border-l-secondary",
    bg: "bg-secondary/10",
    text: "text-secondary",
  },
  "status-normal": {
    border: "border-l-status-normal",
    bg: "bg-status-normal/10",
    text: "text-status-normal",
  },
} as const;

type ColorKey = keyof typeof COLOR_MAP;

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  colorKey: ColorKey;
};

function FeatureCard({
  icon: Icon,
  title,
  description,
  colorKey,
}: FeatureCardProps): React.ReactElement {
  const colors = COLOR_MAP[colorKey];
  return (
    <Card
      className={`border-l-4 ${colors.border} hover:shadow-lg transition-shadow duration-200`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <Icon className={`h-5 w-5 ${colors.text}`} />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

const FEATURE_KEYS = [
  {
    icon: Zap,
    titleKey: "aiAnalysis",
    descKey: "aiAnalysisDesc",
    colorKey: "primary" as ColorKey,
  },
  {
    icon: BarChart3,
    titleKey: "visualDashboard",
    descKey: "visualDashboardDesc",
    colorKey: "secondary" as ColorKey,
  },
  {
    icon: FileText,
    titleKey: "easyUpload",
    descKey: "easyUploadDesc",
    colorKey: "status-normal" as ColorKey,
  },
  {
    icon: Shield,
    titleKey: "securePrivate",
    descKey: "securePrivateDesc",
    colorKey: "primary" as ColorKey,
  },
] as const;

const HOW_IT_WORKS_STEPS = [
  {
    icon: Upload,
    colorClass: "text-primary bg-primary/10",
    titleKey: "howItWorksSteps.step1Title" as const,
    descKey: "howItWorksSteps.step1Desc" as const,
  },
  {
    icon: Sparkles,
    colorClass: "text-secondary bg-secondary/10",
    titleKey: "howItWorksSteps.step2Title" as const,
    descKey: "howItWorksSteps.step2Desc" as const,
  },
  {
    icon: TrendingUp,
    colorClass: "text-status-normal bg-status-normal/10",
    titleKey: "howItWorksSteps.step3Title" as const,
    descKey: "howItWorksSteps.step3Desc" as const,
  },
] as const;

export function LandingPage(): React.ReactElement {
  const router = useRouter();
  const locale = useLocale();
  const { status } = useSession();
  const t = useTranslations("pages.landing");
  const tc = useTranslations("common");
  const tp = useTranslations("privacy");

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Show nothing while checking auth or redirecting
  if (status === "loading" || status === "authenticated") {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

          <div className="container relative mx-auto px-4 py-12 md:py-16 max-w-4xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                {t.rich("heroTitle", {
                  highlight: (chunks) => (
                    <span className="text-primary">{chunks}</span>
                  ),
                })}
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

            {/* Dashboard Preview */}
            <div className="mb-8">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary/20">
                <Image
                  src="/dashboard.jpeg"
                  alt="ViziAI Dashboard Preview"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                {t("dashboardAlt")}
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
              {t("whyPrefix")} <ViziAILogo className="text-2xl md:text-3xl" />?
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {FEATURE_KEYS.map((feature) => (
                <FeatureCard
                  key={feature.titleKey}
                  icon={feature.icon}
                  title={t(`features.${feature.titleKey}`)}
                  description={t(`features.${feature.descKey}`)}
                  colorKey={feature.colorKey}
                />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              {t("howItWorks")}
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {HOW_IT_WORKS_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-2xl ${step.colorClass}`}>
                        <StepIcon className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-muted-foreground/30 mb-2">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t(step.titleKey)}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {t(step.descKey)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Social Proof Placeholder */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">5</div>
                <div className="text-sm text-muted-foreground">
                  {t("socialProof.languages")}
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  <Users className="h-8 w-8 inline" />
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("socialProof.familyProfiles")}
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">
                  {t("socialProof.metricAliases")}
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              {t("socialProof.description")}
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("startTracking")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("neverEasier")}</p>
            <Button
              size="lg"
              asChild
              className="px-8 py-6 text-lg font-semibold"
            >
              <Link href="/login">{t("tryFree")}</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                {tp("title")}
              </Link>
              <span className="text-border">|</span>
              <Link
                href={`/${locale}/blog`}
                className="hover:text-primary transition-colors"
              >
                {t("footer.blog")}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <LocaleSwitcher />
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground mt-4">
            {tc("copyright")}
          </div>
        </div>
      </footer>
    </div>
  );
}
