"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Building2, Calendar, Save, Settings, Split, Target, User as UserIcon } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { SARKARI_DEPARTMENTS, TrackMode } from "@/lib/track-context";
import { APP_CARD_CLASS } from "@/lib/ui-tokens";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COMPANIES = [
  "FAANG",
  "Amazon",
  "Google",
  "Meta",
  "Apple",
  "Netflix",
  "Microsoft",
  "Product-based",
  "Service-based",
  "Startup",
];

export default function SettingsPage() {
  const { dbUser, user, refreshDbUser, applyDbUser } = useAuth();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [modeSaving, setModeSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [modeError, setModeError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [dailyTarget, setDailyTarget] = useState(5);
  const [placementDeadline, setPlacementDeadline] = useState("");
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(true);
  const [activeTrack, setActiveTrack] = useState<TrackMode>("placement");
  const [sarkariDepartment, setSarkariDepartment] = useState("mechanical");

  useEffect(() => {
    if (!dbUser) return;
    setName(dbUser.name || "");
    setDailyTarget(dbUser.preferences?.dailyTarget || 5);
    setPlacementDeadline(
      dbUser.placementDeadline ? new Date(dbUser.placementDeadline).toISOString().slice(0, 10) : ""
    );
    setTargetCompanies(dbUser.targetCompanies || []);
    setNotifications(dbUser.preferences?.notifications ?? true);
    setActiveTrack(dbUser.preferences?.activeTrack || "placement");
    setSarkariDepartment(dbUser.preferences?.sarkariDepartment || "mechanical");
  }, [dbUser]);

  const syncModeAndSeed = async (nextTrack: TrackMode, nextDepartment: string) => {
    if (!user?.uid || !user?.email) {
      setModeError("User session not ready. Please refresh and try again.");
      return;
    }

    setModeSaving(true);
    setModeError(null);
    try {
      const syncRes = await apiClient("/api/auth/sync", {
        method: "POST",
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          name,
          preferences: {
            activeTrack: nextTrack,
            sarkariDepartment: nextDepartment,
            placementMode: nextTrack === "placement",
          },
        }),
      });

      if (!syncRes.ok) {
        const payload = await syncRes.json().catch(() => ({ error: "Failed to switch mode" }));
        throw new Error(payload.error || "Failed to switch mode");
      }

      const syncData = await syncRes.json();
      if (syncData?.user) {
        applyDbUser(syncData.user);
      }

      const seedRes = await apiClient("/api/seed", { method: "POST" });
      if (!seedRes.ok) {
        throw new Error("Failed to load syllabus for selected mode");
      }

      await refreshDbUser();
      await queryClient.invalidateQueries();
      await queryClient.refetchQueries({ type: "active" });
    } catch (err) {
      setModeError(err instanceof Error ? err.message : "Failed to switch mode");
    } finally {
      setModeSaving(false);
    }
  };

  const handleSave = async () => {
    if (!user?.uid || !user?.email) {
      setSaveError("User session not ready. Please refresh and try again.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const res = await apiClient("/api/auth/sync", {
        method: "POST",
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          name,
          preferences: {
            dailyTarget,
            notifications,
            activeTrack,
            sarkariDepartment,
            placementMode: activeTrack === "placement",
          },
          placementDeadline,
          targetCompanies,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({ error: "Failed to save settings" }));
        throw new Error(payload.error || "Failed to save settings");
      }

      const result = await res.json();
      if (result?.user) {
        applyDbUser(result.user);
      }
      await refreshDbUser();
      await queryClient.invalidateQueries();
      await queryClient.refetchQueries({ type: "active" });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleCompany = (company: string) => {
    setTargetCompanies((prev) =>
      prev.includes(company) ? prev.filter((item) => item !== company) : [...prev, company]
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        icon={<Settings className="h-6 w-6 text-indigo-300" />}
        title="Settings"
        subtitle="Manage your account preferences, mode context, and preparation goals."
        right={
          <Badge className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
            {targetCompanies.length} target companies
          </Badge>
        }
      />

      <Card className={APP_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Split className="h-5 w-5 text-indigo-300" />
            Active Track
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-slate-300">Track</Label>
            <Select
              value={activeTrack}
              onValueChange={(value) => {
                const nextTrack = value as TrackMode;
                setActiveTrack(nextTrack);
                void syncModeAndSeed(nextTrack, sarkariDepartment);
              }}
            >
              <SelectTrigger className="mt-1 w-full border-slate-700 bg-slate-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-800 text-white">
                <SelectItem value="placement">Placement</SelectItem>
                <SelectItem value="sarkari">Sarkari Nokari</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {activeTrack === "sarkari" ? (
            <div>
              <Label className="flex items-center gap-2 text-slate-300">
                <Building2 className="h-4 w-4" />
                Sarkari Department
              </Label>
              <Select
                value={sarkariDepartment}
                onValueChange={(value) => {
                  setSarkariDepartment(value);
                  void syncModeAndSeed("sarkari", value);
                }}
              >
                <SelectTrigger className="mt-1 w-full border-slate-700 bg-slate-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-800 text-white">
                  {SARKARI_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {modeSaving ? <p className="text-sm text-indigo-300">Switching mode and loading syllabus...</p> : null}
      {modeError ? <p className="text-sm text-red-300">{modeError}</p> : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className={APP_CARD_CLASS}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <UserIcon className="h-5 w-5 text-indigo-300" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 border-slate-700 bg-slate-800 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Email</Label>
              <Input value={user?.email || ""} disabled className="mt-1 border-slate-700 bg-slate-800/60 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className={APP_CARD_CLASS}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Target className="h-5 w-5 text-indigo-300" />
              Preparation Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300">Daily Target (subtopics)</Label>
              <Input
                type="number"
                value={dailyTarget}
                min={1}
                max={50}
                onChange={(e) => setDailyTarget(Number(e.target.value))}
                className="mt-1 w-full max-w-[10rem] border-slate-700 bg-slate-800 text-white"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2 text-slate-300">
                <Calendar className="h-4 w-4" />
                Placement Deadline
              </Label>
              <Input
                type="date"
                value={placementDeadline}
                onChange={(e) => setPlacementDeadline(e.target.value)}
                className="mt-1 w-full max-w-xs border-slate-700 bg-slate-800 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className={APP_CARD_CLASS}>
          <CardHeader>
            <CardTitle className="text-white text-lg">Target Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {COMPANIES.map((company) => (
                <Badge
                  key={company}
                  variant="outline"
                  onClick={() => toggleCompany(company)}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1 transition-colors",
                    targetCompanies.includes(company)
                      ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-200"
                      : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                  )}
                >
                  {company}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={APP_CARD_CLASS}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Bell className="h-5 w-5 text-indigo-300" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={notifications}
                onCheckedChange={(value) => setNotifications(!!value)}
                className="border-slate-600 data-[state=checked]:bg-indigo-500"
              />
              <span className="text-sm text-slate-300">Enable revision reminders and notifications.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-4 z-20 rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleSave} disabled={saving} className="bg-indigo-500 text-white hover:bg-indigo-600">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>

          {saved ? <span className="text-sm text-emerald-300">Saved successfully.</span> : null}
          {saveError ? <span className="text-sm text-red-300">{saveError}</span> : null}
        </div>
      </div>
    </div>
  );
}
