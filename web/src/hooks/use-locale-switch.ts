"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { setLocale } from "@/app/actions/locale";
import type { Locale } from "@/i18n/config";
import { trackEvent } from "@/lib/analytics";

export function useLocaleSwitch() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const switching = useRef(false);

  function switchTo(target: Locale) {
    if (target === locale || switching.current) return;
    switching.current = true;
    startTransition(async () => {
      try {
        await setLocale(target);
        trackEvent({
          action: "locale_switched",
          category: "engagement",
          label: target,
        });
        router.refresh();
      } finally {
        switching.current = false;
      }
    });
  }

  return { locale, isPending, switchTo };
}
