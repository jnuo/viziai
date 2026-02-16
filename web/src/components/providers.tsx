"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { SentryUser } from "./sentry-user";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SentryUser />
      {children}
    </SessionProvider>
  );
}
