"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import Script from "next/script";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { toLocale } from "@/i18n/config";
import type { Locale } from "@/i18n/config";

const FAQ_CATEGORIES = [
  {
    titleKey: "general",
    keys: ["whatIsViziAI", "howToUpload", "enabizImport", "isFree"],
  },
  {
    titleKey: "dataUpload",
    keys: ["afterUpload", "testsAbroad", "languages"],
  },
  {
    titleKey: "security",
    keys: ["dataSecure", "whoCanSee", "deleteData"],
  },
  {
    titleKey: "features",
    keys: ["familyTracking", "colorMeaning", "referenceRanges"],
  },
  {
    titleKey: "technical",
    keys: ["mobileApp", "chromeExtension"],
  },
] as const;

const CATEGORY_LABELS: Record<
  (typeof FAQ_CATEGORIES)[number]["titleKey"],
  Record<Locale, string>
> = {
  general: {
    tr: "Genel",
    en: "General",
    es: "General",
    de: "Allgemein",
    fr: "Général",
  },
  dataUpload: {
    tr: "Veri ve Yükleme",
    en: "Data & Upload",
    es: "Datos y Subida",
    de: "Daten & Upload",
    fr: "Données & Téléchargement",
  },
  security: {
    tr: "Güvenlik ve Gizlilik",
    en: "Security & Privacy",
    es: "Seguridad y Privacidad",
    de: "Sicherheit & Datenschutz",
    fr: "Sécurité & Confidentialité",
  },
  features: {
    tr: "Özellikler",
    en: "Features",
    es: "Funcionalidades",
    de: "Funktionen",
    fr: "Fonctionnalités",
  },
  technical: {
    tr: "Teknik",
    en: "Technical",
    es: "Técnico",
    de: "Technisch",
    fr: "Technique",
  },
};

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

type FormStatus = "idle" | "sending" | "success" | "error";

function ContactForm(): React.ReactElement {
  const t = useTranslations("faq.contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const recaptchaToken = await new Promise<string>((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(RECAPTCHA_SITE_KEY, { action: "contact" })
            .then(resolve)
            .catch(reject);
        });
      });

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          recaptchaToken,
        }),
      });

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mt-12 mb-4 rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold mb-1">{t("title")}</h2>
      <p className="text-sm text-muted-foreground mb-5">{t("subtitle")}</p>

      {status === "success" ? (
        <p role="alert" className="text-sm text-green-600 dark:text-green-400">
          {t("success")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="contact-name"
                className="block text-sm font-medium mb-1"
              >
                {t("name")}
              </label>
              <input
                id="contact-name"
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label
                htmlFor="contact-email"
                className="block text-sm font-medium mb-1"
              >
                {t("email")}
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="contact-message"
              className="block text-sm font-medium mb-1"
            >
              {t("message")}
            </label>
            <textarea
              id="contact-message"
              required
              maxLength={2000}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            />
          </div>

          {status === "error" && (
            <p role="alert" className="text-sm text-destructive">
              {t("error")}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {status === "sending" ? t("sending") : t("send")}
          </button>
        </form>
      )}
    </section>
  );
}

export function FaqContent(): React.ReactElement {
  const t = useTranslations("faq");
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        {FAQ_CATEGORIES.map((category) => (
          <section key={category.titleKey} className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-primary">
              {CATEGORY_LABELS[category.titleKey][toLocale(locale)]}
            </h2>
            <div className="space-y-3">
              {category.keys.map((key) => (
                <details
                  key={key}
                  className="group rounded-lg border border-border bg-card"
                >
                  <summary className="cursor-pointer select-none px-5 py-4 font-medium flex items-center justify-between gap-2 hover:bg-muted/50 transition-colors rounded-lg">
                    {t(`questions.${key}.q`)}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-4 text-muted-foreground leading-relaxed">
                    {t(`questions.${key}.a`)}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        {RECAPTCHA_SITE_KEY && (
          <>
            <Script
              src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
              strategy="lazyOnload"
            />
            <ContactForm />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
