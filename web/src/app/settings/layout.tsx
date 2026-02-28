"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { useActiveProfile } from "@/hooks/use-active-profile";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeProfile, activeProfileId } = useActiveProfile();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        profileName={activeProfile?.display_name}
        currentProfileId={activeProfileId || undefined}
      />
      <main className="container max-w-4xl mx-auto p-4 flex-1">{children}</main>
      <footer className="py-4 text-center text-xs text-muted-foreground">
        <Link
          href="/privacy"
          className="hover:text-foreground transition-colors"
        >
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
