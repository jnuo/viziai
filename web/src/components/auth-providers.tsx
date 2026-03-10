"use client";

import dynamic from "next/dynamic";

const NotificationChecker = dynamic(
  () =>
    import("@/components/notification-checker").then(
      (m) => m.NotificationChecker,
    ),
  { ssr: false },
);

const PreferenceProvider = dynamic(
  () =>
    import("@/components/preference-sync").then((m) => m.PreferenceProvider),
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
