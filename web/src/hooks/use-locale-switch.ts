"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { setLocale } from "@/app/actions/locale";
import type { Locale } from "@/i18n/config";

export function useLocaleSwitch() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(target: Locale) {
    if (target === locale || isPending) return;
    startTransition(async () => {
      await setLocale(target);
      router.refresh();
    });
  }

  return { locale, isPending, switchTo };
}
