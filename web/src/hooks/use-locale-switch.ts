"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { setLocale } from "@/app/actions/locale";
import { locales, staticPages, type Locale } from "@/i18n/config";
import { trackEvent } from "@/lib/analytics";

/** Resolve target URL when switching locale on a locale-prefixed page. */
function resolveLocalePath(
  path: string,
  currentLocale: Locale,
  target: Locale,
): string | null {
  const match = locales.find(
    (l) => path === `/${l}` || path.startsWith(`/${l}/`),
  );
  if (!match) return null;

  // Homepage
  if (path === `/${match}` || path === `/${match}/`) return `/${target}`;

  const rest = path.slice(match.length + 1); // e.g. "/blog/some-slug"

  // Static pages with translated slugs
  const slug = rest.replace(/^\//, "").replace(/\/$/, "");
  for (const [, slugs] of Object.entries(staticPages)) {
    if (slugs[currentLocale] === slug) {
      return `/${target}/${slugs[target]}`;
    }
  }

  // Blog and other pages — swap locale prefix, keep path
  return `/${target}${rest}`;
}

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

        const targetPath = resolveLocalePath(
          window.location.pathname,
          locale,
          target,
        );
        if (targetPath) {
          router.push(targetPath);
        } else {
          router.refresh();
        }
      } finally {
        switching.current = false;
      }
    });
  }

  return { locale, isPending, switchTo };
}
