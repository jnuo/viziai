"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setLocale } from "@/app/actions/locale";
import type { Locale } from "@/i18n/config";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const switching = useRef(false);

  const nextLocale: Locale = locale === "tr" ? "en" : "tr";

  function handleSwitch() {
    if (switching.current) return;
    switching.current = true;
    startTransition(async () => {
      try {
        await setLocale(nextLocale);
        router.refresh();
      } finally {
        switching.current = false;
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSwitch}
      disabled={isPending}
      className="gap-1.5 text-muted-foreground hover:text-foreground"
      aria-label={locale === "tr" ? "Switch to English" : "Türkçeye geç"}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Globe className="h-4 w-4" />
      )}
      <span className="text-xs font-medium">{nextLocale.toUpperCase()}</span>
    </Button>
  );
}
