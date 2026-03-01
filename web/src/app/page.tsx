import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { locales, defaultLocale } from "@/i18n/config";

export default async function Home() {
  const store = await cookies();
  const raw = store.get("locale")?.value;
  const locale = hasLocale(locales, raw) ? raw : defaultLocale;
  redirect(`/${locale}`);
}
