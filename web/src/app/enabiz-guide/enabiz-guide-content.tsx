"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Chrome, ExternalLink, Info, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CHROME_EXTENSION_URL } from "@/lib/constants";

const LINK_CLASS =
  "inline-flex items-center gap-1 text-primary underline underline-offset-2 hover:text-primary/80 transition-colors";

const STEP_KEYS = [
  "step1",
  "step2",
  "step3",
  "step4",
  "step5",
  "step6",
] as const;

export function EnabizGuideContent(): React.ReactElement {
  const t = useTranslations("enabizGuide");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50 px-4 py-3 mb-8 text-sm">
          <Monitor className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="text-amber-800 dark:text-amber-200">
            {t("desktopOnly")}
          </span>
        </div>

        <ol className="space-y-6">
          {STEP_KEYS.map((key, index) => (
            <li key={key} className="flex gap-4">
              <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {index + 1}
              </div>
              <div className="pt-0.5">
                <h2 className="font-semibold mb-1">
                  {t(`steps.${key}.title`)}
                </h2>
                {key === "step4" && (
                  <div className="mt-3 mb-1">
                    <Image
                      src="/guide-extension-popup.png"
                      alt="Chrome extensions area showing ViziAI — e-Nabız"
                      width={320}
                      height={240}
                      className="rounded-lg border border-border shadow-sm"
                    />
                  </div>
                )}
                {key === "step5" && (
                  <div className="mt-3 mb-1">
                    <Image
                      src="/guide-send-button.png"
                      alt="e-Nabız Tahlillerim page with ViziAI'a Gönder buttons"
                      width={640}
                      height={360}
                      className="rounded-lg border border-border shadow-sm"
                    />
                  </div>
                )}
                <p className="text-muted-foreground text-sm">
                  {t.rich(`steps.${key}.desc`, {
                    cws: (chunks) => (
                      <a
                        href={CHROME_EXTENSION_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={LINK_CLASS}
                      >
                        {chunks}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ),
                    enabiz: (chunks) => (
                      <a
                        href="https://enabiz.gov.tr/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={LINK_CLASS}
                      >
                        {chunks}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ),
                    apikeys: (chunks) => (
                      <a
                        href="/settings/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={LINK_CLASS}
                      >
                        {chunks}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ),
                  })}
                </p>
                {key === "step5" && (
                  <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
                    <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{t("steps.step5.hint")}</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <Button asChild>
            <a
              href={CHROME_EXTENSION_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Chrome className="h-4 w-4 mr-2" />
              {t("installCta")}
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="/settings/api-keys"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("createKeyCta")}
            </a>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
