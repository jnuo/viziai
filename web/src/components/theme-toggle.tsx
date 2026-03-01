"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";

const themes = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
] as const;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("components.header");
  const tc = useTranslations("common");

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground"
        disabled
      >
        <Sun className="h-4 w-4" />
        <span className="text-xs font-medium">{t("lightTheme")}</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";
  const CurrentIcon = isDark ? Moon : Sun;
  const currentLabel = isDark ? t("darkTheme") : t("lightTheme");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          aria-label={tc("toggleTheme")}
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="text-xs font-medium">{currentLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(({ value, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            disabled={resolvedTheme === value}
            className="cursor-pointer gap-2"
          >
            <Check
              className={`h-4 w-4 ${resolvedTheme === value ? "opacity-100" : "opacity-0"}`}
            />
            <Icon className="h-4 w-4" />
            {value === "light" ? t("lightTheme") : t("darkTheme")}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
