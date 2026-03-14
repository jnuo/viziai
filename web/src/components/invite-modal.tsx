"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BookUser, Check, Copy, Loader2, UserCheck } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface KnownUser {
  email: string;
  name: string | null;
}

interface InviteModalProps {
  profileId: string;
  profileName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knownUsers?: KnownUser[];
}

type Step = "form" | "success" | "direct";

export function InviteModal({
  profileId,
  profileName,
  open,
  onOpenChange,
  knownUsers = [],
}: InviteModalProps) {
  const t = useTranslations("components.inviteModal");
  const tc = useTranslations("common");
  const ti = useTranslations("pages.invite");
  const locale = useLocale();

  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [grantedName, setGrantedName] = useState<string | null>(null);
  const [hasContactPicker, setHasContactPicker] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState("");

  useEffect(() => {
    setHasContactPicker("contacts" in navigator && "ContactsManager" in window);
  }, []);

  async function handlePickContact() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contacts = await (navigator as any).contacts.select(["email"], {
        multiple: false,
      });
      if (contacts?.length > 0 && contacts[0].email?.length > 0) {
        setEmail(contacts[0].email[0]);
      }
    } catch {
      // User cancelled or API not available
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/profiles/${profileId}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), accessLevel, locale }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("sendFailed"));
        return;
      }

      if (data.directAccess) {
        setGrantedName(data.name || data.email);
        setStep("direct");
      } else {
        setInviteUrl(data.invite.inviteUrl);
        setInvitedEmail(email.trim());
        setStep("success");
      }
      trackEvent({ action: "profile_shared", category: "engagement" });
    } catch {
      setError(tc("errorOccurred"));
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsApp() {
    const text = t("whatsAppMessage", { profileName, url: inviteUrl });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function handleWhatsAppDirect() {
    const text = t("whatsAppMessageDirect", {
      profileName,
      url: "https://www.viziai.app",
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function dialogTitle(): string {
    switch (step) {
      case "form":
        return t("inviteTitle", { profileName });
      case "direct":
        return ti("accessGranted");
      case "success":
        return t("inviteSentTitle");
    }
  }

  function handleClose(open: boolean) {
    if (!open) {
      setStep("form");
      setEmail("");
      setAccessLevel("viewer");
      setError(null);
      setInviteUrl("");
      setCopied(false);
      setGrantedName(null);
      setInvitedEmail("");
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle()}</DialogTitle>
        </DialogHeader>

        {step === "direct" ? (
          <div className="space-y-4 text-center py-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm">
              {t("directAccessGranted", {
                name: grantedName ?? "",
                profileName,
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("directWhatsAppHint")}
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleWhatsAppDirect}
            >
              {t("directWhatsApp")}
            </Button>
            <Button className="w-full" onClick={() => handleClose(false)}>
              {tc("ok")}
            </Button>
          </div>
        ) : step === "form" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {knownUsers.length > 0 && (
              <div className="space-y-2">
                <Label>{t("knownUsers")}</Label>
                <div className="flex flex-wrap gap-2">
                  {knownUsers.map((user) => (
                    <button
                      key={user.email}
                      type="button"
                      onClick={() => setEmail(user.email)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                        email === user.email
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium shrink-0">
                        {user.name
                          ? user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : user.email[0].toUpperCase()}
                      </span>
                      {user.name || user.email}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="invite-email">
                {knownUsers.length > 0 ? t("orEnterEmail") : t("emailLabel")}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {hasContactPicker && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handlePickContact}
                    title={t("pickContact")}
                    className="shrink-0"
                  >
                    <BookUser className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-level">{t("accessLevelLabel")}</Label>
              <Select value={accessLevel} onValueChange={setAccessLevel}>
                <SelectTrigger id="invite-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    {tc("accessLevel.viewer")}
                  </SelectItem>
                  <SelectItem value="editor">
                    {tc("accessLevel.editor")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t("invite")}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm">
              {t("inviteSentBody", { email: invitedEmail })}
            </p>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {t("shareAlternative")}
              </p>

              <div className="flex gap-2">
                <Input value={inviteUrl} readOnly className="text-xs" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? tc("copied") : tc("copy")}
                </Button>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleWhatsApp}
              >
                {t("shareOnWhatsApp")}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <span className="shrink-0">🔒</span>
              {t("linkDisclaimer", { email: invitedEmail })}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
