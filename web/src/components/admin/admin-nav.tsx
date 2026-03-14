"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/quality", label: "Report Reviews" },
  { href: "/admin/metric-definitions", label: "Metric Definitions" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-6 h-12">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors border-b-2 -mb-px h-full flex items-center",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
