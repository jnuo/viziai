"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Loader2,
  UserPlus,
  X,
  Shield,
  Eye,
  Pencil,
  Crown,
  Copy,
  Check,
  Trash2,
  Mail,
  LogOut,
  Users,
  FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveProfile } from "@/hooks/use-active-profile";
import { InviteModal, type KnownUser } from "@/components/invite-modal";
import { reportError } from "@/lib/error-reporting";

interface Member {
  user_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  access_level: string;
  granted_at: string;
}

interface PendingInvite {
  id: string;
  email: string;
  access_level: string;
  token: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface AllowedEmail {
  id: string;
  email: string;
  created_at: string;
}

interface ProfileAccess {
  profileId: string;
  profileName: string;
  accessLevel: string;
  members: Member[];
  invites: PendingInvite[];
  allowedEmails: AllowedEmail[];
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

export default function AccessPage() {
  const t = useTranslations("pages.access");
  const tc = useTranslations("common");
  const router = useRouter();
  const { profiles, loading: profilesLoading } = useActiveProfile();
  const [accessData, setAccessData] = useState<ProfileAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalProfile, setInviteModalProfile] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [leavingProfile, setLeavingProfile] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState<string | null>(null);

  const profileIds = useMemo(
    () => profiles.map((p) => p.id).join(","),
    [profiles],
  );

  const fetchAccessData = useCallback(async () => {
    if (profiles.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const results = await Promise.all(
        profiles.map(async (profile) => {
          const res = await fetch(`/api/profiles/${profile.id}/access`);
          if (!res.ok) return null;
          const data = await res.json();
          return {
            profileId: profile.id,
            profileName: profile.display_name,
            accessLevel: data.accessLevel || profile.access_level,
            members: data.members || [],
            invites: data.invites || [],
            allowedEmails: data.allowedEmails || [],
          };
        }),
      );

      setAccessData(results.filter(Boolean) as ProfileAccess[]);
    } catch (error) {
      reportError(error, { op: "settings.access.fetch" });
    } finally {
      setLoading(false);
    }
  }, [profileIds]);

  useEffect(() => {
    if (!profilesLoading) {
      fetchAccessData();
    }
  }, [profilesLoading, fetchAccessData]);

  const handleChangeAccess = async (
    profileId: string,
    targetUserId: string,
    newLevel: string,
  ) => {
    try {
      const res = await fetch(
        `/api/profiles/${profileId}/access/${targetUserId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessLevel: newLevel }),
        },
      );

      if (res.ok) {
        await fetchAccessData();
      }
    } catch (error) {
      reportError(error, {
        op: "settings.access.changeAccess",
        profileId,
        targetUserId,
      });
    }
  };

  const handleRemoveAccess = async (
    profileId: string,
    targetUserId: string,
  ) => {
    try {
      const res = await fetch(
        `/api/profiles/${profileId}/access/${targetUserId}`,
        { method: "DELETE" },
      );

      if (res.ok) {
        await fetchAccessData();
      }
    } catch (error) {
      reportError(error, {
        op: "settings.access.removeAccess",
        profileId,
        targetUserId,
      });
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    setDeletingProfile(profileId);
    try {
      const res = await fetch(`/api/profiles/${profileId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setConfirmDelete(null);
        await fetchAccessData();
        window.location.reload();
      }
    } catch (error) {
      reportError(error, { op: "settings.access.deleteProfile", profileId });
    } finally {
      setDeletingProfile(null);
    }
  };

  const handleLeaveProfile = async (profileId: string) => {
    setLeavingProfile(profileId);
    try {
      const res = await fetch(`/api/profiles/${profileId}/leave`, {
        method: "POST",
      });

      if (res.ok) {
        setConfirmLeave(null);
        window.location.reload();
      }
    } catch (error) {
      reportError(error, { op: "settings.access.leaveProfile", profileId });
    } finally {
      setLeavingProfile(null);
    }
  };

  const handleRevokeInvite = async (profileId: string, inviteId: string) => {
    try {
      const res = await fetch(
        `/api/profiles/${profileId}/access/invites/${inviteId}`,
        { method: "DELETE" },
      );

      if (res.ok) {
        await fetchAccessData();
      }
    } catch (error) {
      reportError(error, {
        op: "settings.access.revokeInvite",
        profileId,
        inviteId,
      });
    }
  };

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

  // Empty state: no profiles at all
  if (profiles.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("accessManagement")}</h1>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Users
                  aria-hidden="true"
                  className="h-8 w-8 text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">{t("noProfilesYet")}</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {t("createProfileDescription")}
                </p>
              </div>
              <Button
                onClick={() => router.push("/onboarding?mode=add")}
                className="mt-2"
              >
                <FolderPlus aria-hidden="true" className="h-4 w-4 mr-1.5" />
                {t("createProfile")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ownedProfiles = accessData.filter((p) => p.accessLevel === "owner");
  const sharedProfiles = accessData.filter((p) => p.accessLevel !== "owner");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("accessManagement")}</h1>

      {/* Shared profiles: read-only view with leave option */}
      {sharedProfiles.map((profile) => (
        <Card key={profile.profileId}>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 min-w-0">
                <Shield aria-hidden="true" className="h-5 w-5 shrink-0" />
                <span className="truncate">{profile.profileName}</span>
              </CardTitle>
              <Badge variant="outline" className="gap-1 shrink-0">
                {profile.accessLevel === "viewer" ? (
                  <Eye aria-hidden="true" className="h-3 w-3" />
                ) : (
                  <Pencil aria-hidden="true" className="h-3 w-3" />
                )}
                {tc(
                  `accessLevel.${profile.accessLevel}` as Parameters<
                    typeof tc
                  >[0],
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("membersWithAccess")}
            </p>
            <div className="space-y-2">
              {profile.members.map((member) => (
                <ReadOnlyMemberRow key={member.user_id} member={member} />
              ))}
            </div>

            <div className="pt-4 border-t">
              {confirmLeave === profile.profileId ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <p className="text-sm text-destructive flex-1">
                    {t("leaveConfirm")}
                  </p>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={leavingProfile === profile.profileId}
                      onClick={() => handleLeaveProfile(profile.profileId)}
                    >
                      {leavingProfile === profile.profileId && (
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      )}
                      {t("yesLeave")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmLeave(null)}
                    >
                      {tc("cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setConfirmLeave(profile.profileId)}
                >
                  <LogOut aria-hidden="true" className="h-4 w-4 mr-1.5" />
                  {t("leaveProfile")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Owned profiles: full management view */}
      {ownedProfiles.map((profile) => (
        <Card key={profile.profileId}>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 min-w-0">
                <Shield aria-hidden="true" className="h-5 w-5 shrink-0" />
                <span className="truncate">{profile.profileName}</span>
              </CardTitle>
              <Button
                size="sm"
                className="shrink-0"
                onClick={() =>
                  setInviteModalProfile({
                    id: profile.profileId,
                    name: profile.profileName,
                  })
                }
              >
                <UserPlus aria-hidden="true" className="h-4 w-4 mr-1.5" />
                {t("invite")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {profile.members.map((member) => (
                <MemberRow
                  key={member.user_id}
                  member={member}
                  profileId={profile.profileId}
                  onChangeAccess={handleChangeAccess}
                  onRemoveAccess={handleRemoveAccess}
                />
              ))}
            </div>

            {profile.invites.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("pendingInvites")}
                </p>
                {profile.invites.map((invite) => (
                  <InviteRow
                    key={invite.id}
                    invite={invite}
                    profileId={profile.profileId}
                    onRevoke={handleRevokeInvite}
                  />
                ))}
              </div>
            )}

            {profile.allowedEmails.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("notYetJoined")}
                </p>
                {profile.allowedEmails.map((ae) => (
                  <AllowedEmailRow key={ae.id} allowedEmail={ae} />
                ))}
              </div>
            )}

            <div className="pt-4 border-t">
              {confirmDelete === profile.profileId ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <p className="text-sm text-destructive flex-1">
                    {t("deleteConfirm")}
                  </p>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deletingProfile === profile.profileId}
                      onClick={() => handleDeleteProfile(profile.profileId)}
                    >
                      {deletingProfile === profile.profileId && (
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      )}
                      {tc("yesDelete")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmDelete(null)}
                    >
                      {tc("cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setConfirmDelete(profile.profileId)}
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4 mr-1.5" />
                  {t("deleteProfile")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {inviteModalProfile && (
        <InviteModal
          profileId={inviteModalProfile.id}
          profileName={inviteModalProfile.name}
          open
          onOpenChange={(open) => {
            if (!open) {
              setInviteModalProfile(null);
              fetchAccessData();
            }
          }}
          knownUsers={(() => {
            const targetMembers = new Set(
              accessData
                .find((p) => p.profileId === inviteModalProfile.id)
                ?.members.map((m) => m.email) || [],
            );
            const seen = new Set<string>();
            const users: KnownUser[] = [];
            for (const profile of accessData) {
              for (const member of profile.members) {
                if (
                  !targetMembers.has(member.email) &&
                  !seen.has(member.email)
                ) {
                  seen.add(member.email);
                  users.push({ email: member.email, name: member.name });
                }
              }
            }
            return users;
          })()}
        />
      )}
    </div>
  );
}

// Read-only member row for non-owners
function ReadOnlyMemberRow({ member }: { member: Member }) {
  const tc = useTranslations("common");

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
        {getInitials(member.name, member.email)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {member.name || member.email}
        </p>
        {member.name && (
          <p className="text-xs text-muted-foreground truncate">
            {member.email}
          </p>
        )}
      </div>

      <Badge
        variant={member.access_level === "owner" ? "default" : "outline"}
        className="gap-1 shrink-0"
      >
        {member.access_level === "owner" && (
          <Crown aria-hidden="true" className="h-3 w-3" />
        )}
        {member.access_level === "editor" && (
          <Pencil aria-hidden="true" className="h-3 w-3" />
        )}
        {member.access_level === "viewer" && (
          <Eye aria-hidden="true" className="h-3 w-3" />
        )}
        {tc(`accessLevel.${member.access_level}` as Parameters<typeof tc>[0])}
      </Badge>
    </div>
  );
}

interface MemberRowProps {
  member: Member;
  profileId: string;
  onChangeAccess: (profileId: string, userId: string, level: string) => void;
  onRemoveAccess: (profileId: string, userId: string) => void;
}

function MemberRow({
  member,
  profileId,
  onChangeAccess,
  onRemoveAccess,
}: MemberRowProps) {
  const tc = useTranslations("common");
  const t = useTranslations("pages.access");

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border">
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
        {getInitials(member.name, member.email)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {member.name || member.email}
        </p>
        {member.name && (
          <p className="text-xs text-muted-foreground truncate">
            {member.email}
          </p>
        )}
      </div>

      {member.access_level === "owner" ? (
        <Badge variant="default" className="gap-1 shrink-0">
          <Crown aria-hidden="true" className="h-3 w-3" />
          {tc("accessLevel.owner")}
        </Badge>
      ) : (
        <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-0 ml-11">
          <Select
            value={member.access_level}
            onValueChange={(value) =>
              onChangeAccess(profileId, member.user_id, value)
            }
          >
            <SelectTrigger size="sm" className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">
                <span className="flex items-center gap-1.5">
                  <Eye aria-hidden="true" className="h-3.5 w-3.5" />
                  {tc("accessLevel.viewer")}
                </span>
              </SelectItem>
              <SelectItem value="editor">
                <span className="flex items-center gap-1.5">
                  <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                  {tc("accessLevel.editor")}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemoveAccess(profileId, member.user_id)}
            className="text-destructive hover:text-destructive"
            aria-label={t("removeMember")}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface InviteRowProps {
  invite: PendingInvite;
  profileId: string;
  onRevoke: (profileId: string, inviteId: string) => void;
}

function InviteRow({ invite, profileId, onRevoke }: InviteRowProps) {
  const tc = useTranslations("common");
  const t = useTranslations("pages.access");
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/invite/${invite.token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-dashed">
      <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
        {invite.email[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{invite.email}</p>
        <p className="text-xs text-muted-foreground">
          {tc(`accessLevel.${invite.access_level}` as Parameters<typeof tc>[0])}
        </p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-0 ml-11">
        <Badge variant="outline" className="shrink-0">
          {t("pending")}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          aria-label={t("copyLink")}
        >
          {copied ? (
            <Check aria-hidden="true" className="h-4 w-4 text-primary" />
          ) : (
            <Copy aria-hidden="true" className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRevoke(profileId, invite.id)}
          className="text-destructive hover:text-destructive"
          aria-label={t("revokeInvite")}
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function AllowedEmailRow({ allowedEmail }: { allowedEmail: AllowedEmail }) {
  const t = useTranslations("pages.access");

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed opacity-60">
      <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
        <Mail aria-hidden="true" className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{allowedEmail.email}</p>
        <p className="text-xs text-muted-foreground">
          {t("accountNotCreated")}
        </p>
      </div>
      <Badge variant="outline" className="text-muted-foreground shrink-0">
        {t("awaitingRegistration")}
      </Badge>
    </div>
  );
}
