"use client";

import dynamic from "next/dynamic";
import { PreferenceProvider } from "@/components/preference-sync";

const NotificationChecker = dynamic(
  () =>
    import("@/components/notification-checker").then(
      (m) => m.NotificationChecker,
    ),
  { ssr: false },
);

export function AuthProviders({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <>
      <NotificationChecker />
      <PreferenceProvider>{children}</PreferenceProvider>
    </>
  );
}
