"use client";

import { useTranslations } from "next-intl";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function PrivacyContent(): React.ReactElement {
  const t = useTranslations("privacy");

  const collectionItems = [
    "account",
    "bloodTests",
    "labValues",
    "tracking",
    "usage",
  ] as const;

  const gdprItems = [
    "access",
    "export",
    "delete",
    "correct",
    "withdraw",
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("lastUpdated")}</p>
        </div>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          {t("intro")}
        </p>

        <Section title={t("dataCollection.title")}>
          <p className="text-muted-foreground mb-3">
            {t("dataCollection.description")}
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            {collectionItems.map((item) => (
              <li key={item}>{t(`dataCollection.items.${item}`)}</li>
            ))}
          </ul>
        </Section>

        <Section title={t("dataStorage.title")}>
          <p className="text-muted-foreground leading-relaxed">
            {t("dataStorage.description")}
          </p>
        </Section>

        <Section title={t("aiProcessing.title")}>
          <p className="text-muted-foreground leading-relaxed">
            {t("aiProcessing.description")}
          </p>
        </Section>

        <Section title={t("cookies.title")}>
          <p className="text-muted-foreground leading-relaxed">
            {t("cookies.description")}
          </p>
        </Section>

        <Section title={t("gdpr.title")}>
          <p className="text-muted-foreground mb-3">{t("gdpr.description")}</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            {gdprItems.map((item) => (
              <li key={item}>{t(`gdpr.items.${item}`)}</li>
            ))}
          </ul>
        </Section>

        <Section title={t("dataDeletion.title")}>
          <p className="text-muted-foreground leading-relaxed">
            {t("dataDeletion.description")}
          </p>
        </Section>

        <Section title={t("contact.title")}>
          <p className="text-muted-foreground mb-2">
            {t("contact.description")}
          </p>
          <a
            href={`mailto:${t("contact.email")}`}
            className="text-primary hover:underline font-medium"
          >
            {t("contact.email")}
          </a>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
