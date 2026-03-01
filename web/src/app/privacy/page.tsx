import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PrivacyContent } from "./privacy-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy");
  return {
    title: t("title"),
  };
}

export default function PrivacyPage(): React.ReactElement {
  return <PrivacyContent />;
}
