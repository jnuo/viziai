"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Loader2, Settings, User, Globe, Clock, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { locales, localeLabels, type Locale } from "@/i18n/config";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";
import { reportError } from "@/lib/error-reporting";

const TIMEZONES = [
  { value: "Europe/Istanbul", label: "Istanbul (UTC+3)" },
  { value: "Europe/London", label: "London (UTC+0/+1)" },
  { value: "Europe/Berlin", label: "Berlin (UTC+1/+2)" },
  { value: "Europe/Paris", label: "Paris (UTC+1/+2)" },
  { value: "Europe/Madrid", label: "Madrid (UTC+1/+2)" },
  { value: "Europe/Moscow", label: "Moscow (UTC+3)" },
  { value: "America/New_York", label: "New York (UTC-5/-4)" },
  { value: "America/Chicago", label: "Chicago (UTC-6/-5)" },
  { value: "America/Denver", label: "Denver (UTC-7/-6)" },
  { value: "America/Los_Angeles", label: "Los Angeles (UTC-8/-7)" },
  { value: "Asia/Dubai", label: "Dubai (UTC+4)" },
  { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
  { value: "Australia/Sydney", label: "Sydney (UTC+10/+11)" },
] as const;

interface Preferences {
  name: string;
  email: string;
  locale: string;
  timezone: string;
  theme: string;
}

export default function PreferencesPage() {
  const { data: session, status } = useSession();
  const { theme: currentTheme, setTheme } = useTheme();
  const router = useRouter();
  const { addToast } = useToast();
  const t = useTranslations("pages.preferences");
  const tc = useTranslations("common");
  const currentLocale = useLocale();
  const { switchTo } = useLocaleSwitch();

  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state — seeded from client-side values so dropdowns are never empty
  const [name, setName] = useState(session?.user?.name || "");
  const [locale, setLocaleValue] = useState(currentLocale);
  const [timezone, setTimezone] = useState("Europe/Istanbul");
  const [theme, setThemeValue] = useState(currentTheme || "system");

  // Ref to always have latest values in persistField without stale closures
  const latestRef = useRef({ name, locale, timezone, theme });
  latestRef.current = { name, locale, timezone, theme };

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchPrefs() {
      try {
        const res = await fetch("/api/user/preferences");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setPrefs(data);
        setName(data.name || "");
        setLocaleValue(data.locale || "tr");
        setTimezone(data.timezone || "Europe/Istanbul");
        setThemeValue(data.theme || "system");
      } catch (err) {
        reportError(err, { op: "preferences.fetch" });
      } finally {
        setLoading(false);
      }
    }

    fetchPrefs();
  }, [status]);

  // Persist a field to the API immediately
  const persistField = useCallback(
    async (field: string, value: string) => {
      try {
        const body = { ...latestRef.current, [field]: value };
        const res = await fetch("/api/user/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, name: body.name.trim() }),
        });
        if (!res.ok) throw new Error("Failed to save");
        if (prefs) setPrefs({ ...prefs, ...body, name: body.name.trim() });
      } catch (err) {
        reportError(err, { op: `preferences.save.${field}` });
        addToast({ message: tc("saveFailed"), type: "error" });
      }
    },
    [prefs, addToast, tc],
  );

  // Theme: apply instantly + persist
  function handleThemeChange(value: string) {
    setThemeValue(value);
    setTheme(value);
    persistField("theme", value);
  }

  // Language: apply instantly + persist
  function handleLocaleChange(value: string) {
    const loc = value as Locale;
    setLocaleValue(loc);
    persistField("locale", value);
    switchTo(loc);
  }

  // Timezone: persist on change
  function handleTimezoneChange(value: string) {
    setTimezone(value);
    persistField("timezone", value);
  }

  // Name: save on blur (user finishes typing and leaves the field)
  function handleNameBlur() {
    const trimmed = name.trim();
    if (prefs && trimmed !== (prefs.name || "")) {
      persistField("name", trimmed);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="sr-only">{tc("loading")}</span>
      </div>
    );
  }

  if (status !== "authenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Settings aria-hidden="true" className="h-6 w-6" />
        {t("title")}
      </h1>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User aria-hidden="true" className="h-4 w-4" />
            {t("account")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("displayName")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              placeholder={t("displayNamePlaceholder")}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">{t("displayNameHint")}</p>
          </div>
          <div className="space-y-2">
            <Label>{t("email")}</Label>
            <Input value={prefs?.email || ""} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">{t("emailHint")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe aria-hidden="true" className="h-4 w-4" />
            {t("language")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="locale">{t("languageLabel")}</Label>
          <Select value={locale} onValueChange={handleLocaleChange}>
            <SelectTrigger id="locale" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locales.map((l) => (
                <SelectItem key={l} value={l}>
                  {localeLabels[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{t("languageHint")}</p>
        </CardContent>
      </Card>

      {/* Timezone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock aria-hidden="true" className="h-4 w-4" />
            {t("timezone")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="timezone">{t("timezoneLabel")}</Label>
          <Select value={timezone} onValueChange={handleTimezoneChange}>
            <SelectTrigger id="timezone" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{t("timezoneHint")}</p>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette aria-hidden="true" className="h-4 w-4" />
            {t("theme")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="theme">{t("themeLabel")}</Label>
          <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger id="theme" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">{t("themeSystem")}</SelectItem>
              <SelectItem value="light">{t("themeLight")}</SelectItem>
              <SelectItem value="dark">{t("themeDark")}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{t("themeHint")}</p>
        </CardContent>
      </Card>

      {/* Bottom spacing */}
      <div className="pb-4" />
    </div>
  );
}
