"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { setLocale } from "@/app/actions/locale";
import { type Locale, locales } from "@/i18n/config";
import { useRouter } from "next/navigation";
import { DEFAULT_TIMEZONE } from "@/lib/date";

interface TimezoneContextValue {
  timezone: string;
  setTimezone: (tz: string) => void;
}

const TimezoneContext = createContext<TimezoneContextValue>({
  timezone: DEFAULT_TIMEZONE,
  setTimezone: () => {},
});

export function useTimezone() {
  return useContext(TimezoneContext).timezone;
}

export function useSetTimezone() {
  return useContext(TimezoneContext).setTimezone;
}

/**
 * Syncs user preferences (locale, theme, timezone) from the database
 * after login. Provides timezone via context to child components.
 */
export function PreferenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const { setTheme } = useTheme();
  const currentLocale = useLocale();
  const router = useRouter();
  const synced = useRef(false);
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);

  useEffect(() => {
    if (status !== "authenticated" || synced.current) return;
    synced.current = true;

    async function syncPreferences() {
      try {
        const res = await fetch("/api/user/preferences");
        if (!res.ok) return;
        const data = await res.json();

        // Sync timezone
        if (data.timezone) {
          setTimezone(data.timezone);
        }

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

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone }}>
      {children}
    </TimezoneContext.Provider>
  );
}
