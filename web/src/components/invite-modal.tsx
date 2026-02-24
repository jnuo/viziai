"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Loader2, UserCheck } from "lucide-react";
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

  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [grantedName, setGrantedName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/profiles/${profileId}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), accessLevel }),
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
        setStep("success");
      }
    } catch {
      setError(tc("errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = t("whatsAppMessage", { profileName, url: inviteUrl });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset state on close
      setStep("form");
      setEmail("");
      setAccessLevel("viewer");
      setError(null);
      setInviteUrl("");
      setCopied(false);
      setGrantedName(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "form"
              ? t("inviteTitle", { profileName })
              : step === "direct"
                ? ti("accessGranted")
                : ti("inviteLink")}
          </DialogTitle>
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
              <Input
                id="invite-email"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t("invite")}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("shareLink")}</p>

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
        )}
      </DialogContent>
    </Dialog>
  );
}
