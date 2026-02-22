"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";
import { Settings, User as UserIcon, Calendar, Target, Bell, Save, Split, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { SARKARI_DEPARTMENTS, TrackMode } from "@/lib/track-context";
import { PageHeader } from "@/components/common/page-header";
import { APP_CARD_CLASS } from "@/lib/ui-tokens";
import NumberTicker from "@/components/ui/number-ticker";
import { SectionReveal } from "@/components/common/section-reveal";

const COMPANIES = [
    "FAANG", "Amazon", "Google", "Meta", "Apple", "Netflix",
    "Microsoft", "Product-based", "Service-based", "Startup",
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
        if (dbUser) {
            setName(dbUser.name || "");
            setDailyTarget(dbUser.preferences?.dailyTarget || 5);
            setPlacementDeadline(
                dbUser.placementDeadline
                    ? format(new Date(dbUser.placementDeadline), "yyyy-MM-dd")
                    : ""
            );
            setTargetCompanies(dbUser.targetCompanies || []);
            setNotifications(dbUser.preferences?.notifications ?? true);
            setActiveTrack(dbUser.preferences?.activeTrack || "placement");
            setSarkariDepartment(dbUser.preferences?.sarkariDepartment || "mechanical");
        }
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
                    firebaseUid: user?.uid,
                    email: user?.email,
                    name,
                    preferences: {
                        activeTrack: nextTrack,
                        sarkariDepartment: nextDepartment,
                        placementMode: nextTrack === "placement",
                    },
                }),
            });

            if (!syncRes.ok) {
                const syncData = await syncRes.json().catch(() => ({ error: "Failed to switch mode" }));
                throw new Error(syncData.error || "Failed to switch mode");
            }
            const syncData = await syncRes.json();
            if (syncData?.user) {
                applyDbUser(syncData.user);
            }

            const seedRes = await apiClient("/api/seed", { method: "POST" });
            if (!seedRes.ok) {
                const seedData = await seedRes.json().catch(() => ({ error: "Failed to load syllabus for selected mode" }));
                throw new Error(seedData.error || "Failed to load syllabus for selected mode");
            }

            await refreshDbUser();
            await queryClient.invalidateQueries();
            await queryClient.refetchQueries({ type: "active" });
        } catch (error) {
            setModeError(error instanceof Error ? error.message : "Failed to switch mode");
        } finally {
            setModeSaving(false);
        }
    };

    const handleTrackChange = (nextTrack: TrackMode) => {
        setActiveTrack(nextTrack);
        const dept = sarkariDepartment;
        void syncModeAndSeed(nextTrack, dept);
    };

    const handleDepartmentChange = (nextDepartment: string) => {
        setSarkariDepartment(nextDepartment);
        if (activeTrack === "sarkari") {
            void syncModeAndSeed("sarkari", nextDepartment);
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
                    firebaseUid: user?.uid,
                    email: user?.email,
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
                const data = await res.json().catch(() => ({ error: "Failed to save settings" }));
                throw new Error(data.error || "Failed to save settings");
            }
            const data = await res.json();
            if (data?.user) {
                applyDbUser(data.user);
            }
            await refreshDbUser();
            await queryClient.invalidateQueries();
            await queryClient.refetchQueries({ type: "active" });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error("Save error:", error);
            setSaveError(error instanceof Error ? error.message : "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const toggleCompany = (company: string) => {
        setTargetCompanies((prev) =>
            prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
        );
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <PageHeader
                icon={<Settings className="w-6 h-6 text-indigo-400" />}
                title="Settings"
                subtitle="Configure profile, mode, and preparation preferences."
                typewriterWords={[
                    { text: "Settings" },
                    { text: "Control", className: "text-indigo-300" },
                ]}
                helpText="Changes here update your profile, mode context, reminders, and target-company focus used across dashboards."
                right={
                    <Badge className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        <NumberTicker value={targetCompanies.length} className="text-indigo-200 mr-1" /> targets
                    </Badge>
                }
            />

            <SectionReveal>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={APP_CARD_CLASS}>
                    <CardHeader>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                            <Split className="w-5 h-5 text-indigo-400" />
                            Active Mode
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-slate-300">Track</Label>
                            <Select value={activeTrack} onValueChange={(v) => handleTrackChange(v as TrackMode)}>
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1 w-full sm:w-64">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="placement">Placement</SelectItem>
                                    <SelectItem value="sarkari">Sarkari Nokari</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {activeTrack === "sarkari" && (
                            <div>
                                <Label className="text-slate-300 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    Sarkari Department
                                </Label>
                                <Select value={sarkariDepartment} onValueChange={handleDepartmentChange}>
                                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1 w-full sm:w-64">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        {SARKARI_DEPARTMENTS.map((dept) => (
                                            <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
            </SectionReveal>

            {modeSaving && (
                <p className="text-sm text-indigo-300">Switching mode and loading relevant syllabus...</p>
            )}
            {modeError && (
                <p className="text-sm text-red-300">{modeError}</p>
            )}

            <SectionReveal className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className={APP_CARD_CLASS}>
                    <CardContent className="pt-4 pb-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Daily target</p>
                        <p className="text-2xl font-semibold text-white mt-1">
                            <NumberTicker value={dailyTarget} className="text-white" />
                        </p>
                    </CardContent>
                </Card>
                <Card className={APP_CARD_CLASS}>
                    <CardContent className="pt-4 pb-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Target companies</p>
                        <p className="text-2xl font-semibold text-white mt-1">
                            <NumberTicker value={targetCompanies.length} className="text-white" />
                        </p>
                    </CardContent>
                </Card>
                <Card className={APP_CARD_CLASS}>
                    <CardContent className="pt-4 pb-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Track mode</p>
                        <p className="text-lg font-semibold text-white mt-1">
                            {activeTrack === "placement" ? "Placement" : "Sarkari"}
                        </p>
                    </CardContent>
                </Card>
            </SectionReveal>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className={APP_CARD_CLASS}>
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-indigo-400" />
                                Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-slate-300">Name</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-300">Email</Label>
                                <Input
                                    value={user?.email || ""}
                                    disabled
                                    className="bg-slate-800/50 border-slate-700 text-slate-500 mt-1"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className={APP_CARD_CLASS}>
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-400" />
                                Preparation Goals
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-slate-300">Daily Target (subtopics)</Label>
                                <Input
                                    type="number"
                                    value={dailyTarget}
                                    onChange={(e) => setDailyTarget(Number(e.target.value))}
                                    min={1}
                                    max={50}
                                    className="bg-slate-800 border-slate-700 text-white mt-1 w-full max-w-[10rem] sm:w-32"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-300 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Placement Deadline
                                </Label>
                                <Input
                                    type="date"
                                    value={placementDeadline}
                                    onChange={(e) => setPlacementDeadline(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white mt-1 w-full max-w-xs sm:w-56"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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
                                        className={`cursor-pointer transition-all rounded-full px-3 py-1 ${targetCompanies.includes(company)
                                            ? "bg-indigo-500/25 border-indigo-400/40 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                                            : "border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
                                            }`}
                                    >
                                        {company}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className={APP_CARD_CLASS}>
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <Bell className="w-5 h-5 text-indigo-400" />
                                Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={notifications}
                                    onCheckedChange={(v) => setNotifications(!!v)}
                                    className="border-slate-600 data-[state=checked]:bg-indigo-500"
                                />
                                <span className="text-sm text-slate-300">
                                    Enable revision reminders and notifications
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="sticky bottom-4 z-20">
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/80 backdrop-blur-md px-4 py-3 flex flex-wrap items-center gap-3">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    {saved && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-green-400 text-sm"
                        >
                            Saved successfully
                        </motion.span>
                    )}
                    {saveError && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-red-400 text-sm"
                        >
                            {saveError}
                        </motion.span>
                    )}
                </div>
            </div>
        </div>
    );
}
