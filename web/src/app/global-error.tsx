"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>{t("somethingWentWrong")}</h2>
          <p style={{ color: "#666", margin: "1rem 0" }}>{t("errorLogged")}</p>
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              background: "#0D9488",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {t("errorRetry")}
          </button>
        </div>
      </body>
    </html>
  );
}
