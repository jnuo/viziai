"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ViziAILogo } from "@/components/viziai-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Moon,
  Sun,
  Upload,
  Plus,
  Heart,
  Scale,
  LogOut,
  Users,
  FileText,
  Globe,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { locales, localeLabels } from "@/i18n/config";
import { ProfileSwitcher } from "@/components/profile-switcher";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { AddBloodPressureDialog } from "@/components/add-blood-pressure-dialog";
import { AddWeightDialog } from "@/components/add-weight-dialog";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";

interface HeaderProps {
  profileName?: string | null;
  currentProfileId?: string;
  onLogout?: () => void;
  onLogin?: () => void;
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Header({
  profileName,
  currentProfileId,
  onLogout,
  onLogin,
}: HeaderProps): React.ReactElement {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [bpDialogOpen, setBpDialogOpen] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const t = useTranslations("components.header");
  const { locale, switchTo } = useLocaleSwitch();

  const isLoggedIn = status === "authenticated";
  const isDark = theme === "dark";
  const userName = session?.user?.name;

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleLoginClick(): void {
    if (onLogin) {
      onLogin();
      return;
    }
    router.push("/login");
  }

  async function handleLogoutClick(): Promise<void> {
    if (onLogout) {
      onLogout();
      return;
    }
    const { signOut } = await import("next-auth/react");
    await signOut({ callbackUrl: "/" });
  }

  function handleTrackingSaved(): void {
    window.dispatchEvent(new Event("tracking-updated"));
  }

  return (
    <>
      <header className="border-b bg-card">
        <nav
          className="flex items-center justify-between px-3 py-2.5 sm:px-6 md:px-8"
          aria-label={t("mainNav")}
        >
          {/* Left: Logo + Profile Switcher */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/dashboard"
              className="hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
              aria-label={t("home")}
            >
              <ViziAILogo />
            </Link>
            {isLoggedIn && (
              <ProfileSwitcher
                currentProfileId={currentProfileId}
                currentProfileName={profileName ?? undefined}
              />
            )}
          </div>

          {/* Right: Nav + Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Locale Switcher — only when not logged in (otherwise inside user menu) */}
            {!isLoggedIn && <LocaleSwitcher />}

            {/* Tahliller nav link — desktop only */}
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/settings")}
                className="hidden sm:flex gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <FileText className="h-4 w-4" />
                {t("testReports")}
              </Button>
            )}

            {/* + Ekle dropdown */}
            {isLoggedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 border-primary/30 hover:border-primary hover:bg-primary/5"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("add")}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => setBpDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <Heart className="h-4 w-4 text-status-critical" />
                    {t("addBP")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setWeightDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <Scale className="h-4 w-4 text-primary" />
                    {t("addWeight")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/upload")}
                    className="cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    {t("uploadReport")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User avatar dropdown */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    aria-label={t("userMenu")}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="text-xs font-semibold text-primary">
                        {getInitials(userName)}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {/* Mobile-only: Tahliller */}
                  <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="sm:hidden cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    {t("testReports")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/settings/access")}
                    className="cursor-pointer"
                  >
                    <Users className="h-4 w-4" />
                    {t("profiles")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {mounted && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                        {isDark ? (
                          <Moon className="h-4 w-4 text-brand-primary" />
                        ) : (
                          <Sun className="h-4 w-4 text-brand-secondary" />
                        )}
                        {isDark ? t("darkTheme") : t("lightTheme")}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem
                          onClick={() => setTheme("light")}
                          className="cursor-pointer"
                        >
                          <Check
                            className={`h-4 w-4 ${!isDark ? "opacity-100" : "opacity-0"}`}
                          />
                          {t("lightTheme")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setTheme("dark")}
                          className="cursor-pointer"
                        >
                          <Check
                            className={`h-4 w-4 ${isDark ? "opacity-100" : "opacity-0"}`}
                          />
                          {t("darkTheme")}
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                      <Globe className="h-4 w-4" />
                      {localeLabels[locale]}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {locales.map((l) => (
                        <DropdownMenuItem
                          key={l}
                          onClick={() => switchTo(l)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={`h-4 w-4 ${l === locale ? "opacity-100" : "opacity-0"}`}
                          />
                          {localeLabels[l]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogoutClick}
                    className="cursor-pointer"
                    variant="destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" onClick={handleLoginClick}>
                {t("login")}
              </Button>
            )}
          </div>
        </nav>
      </header>

      {/* Tracking Dialogs (owned by header, accessible from any page) */}
      {isLoggedIn && currentProfileId && profileName && (
        <>
          <AddBloodPressureDialog
            open={bpDialogOpen}
            onOpenChange={setBpDialogOpen}
            profileId={currentProfileId}
            profileName={profileName}
            onSaved={handleTrackingSaved}
          />
          <AddWeightDialog
            open={weightDialogOpen}
            onOpenChange={setWeightDialogOpen}
            profileId={currentProfileId}
            profileName={profileName}
            onSaved={handleTrackingSaved}
          />
        </>
      )}
    </>
  );
}
