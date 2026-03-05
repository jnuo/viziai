"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Loader2,
  Plus,
  Key,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveProfile } from "@/hooks/use-active-profile";
import { reportError } from "@/lib/error-reporting";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  profile_id: string;
  profile_name: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export default function ApiKeysPage() {
  const t = useTranslations("pages.apiKeys");
  const tc = useTranslations("common");
  const {
    profiles,
    activeProfileId,
    loading: profilesLoading,
  } = useActiveProfile();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [keyName, setKeyName] = useState("e-Nabız Extension");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    if (!activeProfileId) return;
    try {
      const res = await fetch(
        `/api/settings/api-keys?profileId=${activeProfileId}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (error) {
      reportError(error, { op: "apiKeys.page.fetch" });
    } finally {
      setLoading(false);
    }
  }, [activeProfileId]);

  useEffect(() => {
    if (!profilesLoading && activeProfileId) {
      setLoading(true);
      fetchKeys();
    }
  }, [profilesLoading, activeProfileId, fetchKeys]);

  const handleCreate = async () => {
    if (!selectedProfileId) return;
    setCreating(true);
    try {
      const res = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: selectedProfileId,
          name: keyName,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create key");
      }

      const data = await res.json();
      setNewKey(data.key);
      await fetchKeys();
    } catch (error) {
      reportError(error, { op: "apiKeys.page.create" });
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    setRevoking(keyId);
    try {
      const res = await fetch(`/api/settings/api-keys?id=${keyId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConfirmRevoke(null);
        await fetchKeys();
      }
    } catch (error) {
      reportError(error, { op: "apiKeys.page.revoke" });
    } finally {
      setRevoking(null);
    }
  };

  const handleCopyKey = async () => {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openCreateDialog = () => {
    const writeProfiles = profiles.filter(
      (p) => p.access_level === "owner" || p.access_level === "editor",
    );
    const activeIsWritable = writeProfiles.find(
      (p) => p.id === activeProfileId,
    );
    if (activeIsWritable) {
      setSelectedProfileId(activeIsWritable.id);
    } else if (writeProfiles.length > 0) {
      setSelectedProfileId(writeProfiles[0].id);
    }
    setKeyName("e-Nabız Extension");
    setNewKey(null);
    setCopied(false);
    setShowCreateDialog(true);
  };

  const activeKeys = keys.filter((k) => !k.revoked_at);
  const revokedKeys = keys.filter((k) => k.revoked_at);
  const writeProfiles = profiles.filter(
    (p) => p.access_level === "owner" || p.access_level === "editor",
  );

  if (profilesLoading || loading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="sr-only">{tc("loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        {writeProfiles.length > 0 && (
          <Button size="sm" onClick={openCreateDialog}>
            <Plus aria-hidden="true" className="h-4 w-4 mr-1.5" />
            {t("createKey")}
          </Button>
        )}
      </div>

      {/* Desktop-only notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Monitor
              aria-hidden="true"
              className="h-5 w-5 text-primary shrink-0 mt-0.5"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium">{t("extensionTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {t("extensionDescription")}
              </p>
              <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-0.5 mt-2">
                <li>{t("step1")}</li>
                <li>{t("step2")}</li>
                <li>{t("step3")}</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active keys */}
      {activeKeys.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Key
                  aria-hidden="true"
                  className="h-8 w-8 text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">{t("noKeys")}</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {t("noKeysDescription")}
                </p>
              </div>
              {writeProfiles.length > 0 && (
                <Button onClick={openCreateDialog} className="mt-2">
                  <Plus aria-hidden="true" className="h-4 w-4 mr-1.5" />
                  {t("createKey")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeKeys.map((key) => (
            <Card key={key.id}>
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Key
                    aria-hidden="true"
                    className="h-4 w-4 text-primary shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{key.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {key.profile_name} &middot; {key.key_prefix}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {key.last_used_at && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {t("lastUsed")}{" "}
                        {new Date(key.last_used_at).toLocaleDateString(
                          "tr-TR",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </Badge>
                    )}
                    {confirmRevoke === key.id ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={revoking === key.id}
                          onClick={() => handleRevoke(key.id)}
                        >
                          {revoking === key.id && (
                            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                          )}
                          {t("confirmRevoke")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmRevoke(null)}
                        >
                          {tc("cancel")}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmRevoke(key.id)}
                        className="text-destructive hover:text-destructive"
                        aria-label={t("revokeKey")}
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Revoked keys */}
      {revokedKeys.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t("revokedKeys")}
          </h2>
          {revokedKeys.map((key) => (
            <Card key={key.id} className="opacity-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Key
                    aria-hidden="true"
                    className="h-4 w-4 text-muted-foreground shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-through">
                      {key.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {key.profile_name} &middot; {key.key_prefix}...
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-destructive shrink-0"
                  >
                    {t("revoked")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create key dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setNewKey(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createKeyTitle")}</DialogTitle>
          </DialogHeader>

          {newKey ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 text-sm">
                <AlertTriangle
                  aria-hidden="true"
                  className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                />
                <p className="text-amber-800 dark:text-amber-300">
                  {t("keyWarning")}
                </p>
              </div>
              <div className="relative">
                <code className="block p-3 bg-muted rounded-md text-xs break-all font-mono">
                  {newKey}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1"
                  onClick={handleCopyKey}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowCreateDialog(false)}>
                  {t("done")}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  {tc("profile")}
                </label>
                <Select
                  value={selectedProfileId}
                  onValueChange={setSelectedProfileId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tc("selectProfile")} />
                  </SelectTrigger>
                  <SelectContent>
                    {writeProfiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  {t("keyNameLabel")}
                </label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="e-Nabız Extension"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  {tc("cancel")}
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={creating || !selectedProfileId}
                >
                  {creating && (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  )}
                  {t("createKey")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
