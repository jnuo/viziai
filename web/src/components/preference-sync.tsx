"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { setLocale } from "@/app/actions/locale";
import { type Locale, locales } from "@/i18n/config";
import { useRouter } from "next/navigation";

/**
 * Syncs user preferences (locale, theme) from the database
 * after login. Runs once per session.
 */
export function PreferenceSync() {
  const { status } = useSession();
  const { setTheme } = useTheme();
  const currentLocale = useLocale();
  const router = useRouter();
  const synced = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || synced.current) return;
    synced.current = true;

    async function syncPreferences() {
      try {
        const res = await fetch("/api/user/preferences");
        if (!res.ok) return;
        const data = await res.json();

        // Sync theme
        if (data.theme && data.theme !== "system") {
          setTheme(data.theme);
        }

        // Sync locale
        if (
          data.locale &&
          locales.includes(data.locale as Locale) &&
          data.locale !== currentLocale
        ) {
          await setLocale(data.locale as Locale);
          router.refresh();
        }
      } catch {
        // Silently ignore sync errors — preferences will use defaults
      }
    }

    syncPreferences();
  }, [status, setTheme, currentLocale, router]);

  return null;
}
