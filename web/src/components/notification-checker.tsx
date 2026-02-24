"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast";
import { reportError } from "@/lib/error-reporting";

export function NotificationChecker() {
  const { status } = useSession();
  const { addToast } = useToast();
  const checked = useRef(false);
  const t = useTranslations("common.accessLevel");
  const tn = useTranslations("components.notification");

  useEffect(() => {
    if (status !== "authenticated" || checked.current) return;
    checked.current = true;

    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (!data.notifications?.length) return;

        for (const n of data.notifications) {
          const grantor = n.granted_by_name || "?";
          const level = t(n.access_level as "owner" | "editor" | "viewer");
          addToast({
            message: tn("addedToProfile", {
              grantor,
              profileName: n.profile_name,
              level,
            }),
            type: "info",
            duration: 10000,
            action: {
              label: tn("viewProfiles"),
              href: "/settings/access",
            },
          });
        }

        fetch("/api/notifications", { method: "POST" });
      })
      .catch((err) => reportError(err, { op: "notifications.check" }));
  }, [status, addToast, t, tn]);

  return null;
}
