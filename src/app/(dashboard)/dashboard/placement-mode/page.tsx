"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Zap, Lock, Timer, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInDays, format } from "date-fns";

export default function PlacementModePage() {
    const { dbUser, user, refreshDbUser } = useAuth();

    const { data, isLoading } = useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => {
            const res = await apiClient("/api/dashboard");
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
    });

    const isActive = dbUser?.preferences?.placementMode || false;

    const toggleMutation = useMutation({
        mutationFn: async (nextPlacementMode: boolean) => {
            const res = await apiClient("/api/auth/sync", {
                method: "POST",
                body: JSON.stringify({
                    firebaseUid: user?.uid,
                    email: user?.email,
                    name: dbUser?.name || user?.displayName || user?.email?.split("@")[0] || "User",
                    preferences: { placementMode: nextPlacementMode },
                }),
            });
            if (!res.ok) throw new Error("Failed to update placement mode");
            return res.json();
        },
        onSuccess: async () => {
            await refreshDbUser();
        },
    });

    const metrics = data?.metrics;
    const subjectProgress = data?.subjectProgress || [];
    const deadline = dbUser?.placementDeadline ? new Date(dbUser.placementDeadline) : null;
    const daysRemaining = deadline ? differenceInDays(deadline, new Date()) : null;

    const incompleteSubjects = subjectProgress.filter(
        (s: { progress: number }) => s.progress < 100
    );

    return (
        <div className={`space-y-6 ${isActive ? "placement-mode" : ""}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Zap className={`w-6 h-6 ${isActive ? "text-red-400" : "text-indigo-400"}`} />
                        Placement Mode
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Intensive 30-day preparation focus mode
                    </p>
                </div>
                <Button
                    onClick={() => toggleMutation.mutate(!isActive)}
                    disabled={toggleMutation.isPending}
                    className={
                        isActive
                            ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
                            : "bg-indigo-500 hover:bg-indigo-600 text-white"
                    }
                >
                    {toggleMutation.isPending ? "Saving..." : isActive ? "Deactivate" : "Activate"}
                </Button>
            </div>

            {isActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <Timer className="w-6 h-6 text-red-400 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-red-400 font-bold text-lg">
                                {daysRemaining !== null
                                    ? `${Math.max(0, daysRemaining)} Days Remaining`
                                    : "Set your deadline in Settings"}
                            </p>
                            <p className="text-xs text-slate-400">
                                {deadline ? `Placement deadline: ${format(deadline, "MMMM d, yyyy")}` : "No deadline set"}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-2xl bg-slate-800/50" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-slate-900/50 border-slate-800/50">
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {incompleteSubjects.length}
                                    </p>
                                    <p className="text-xs text-slate-400">Incomplete Subjects</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900/50 border-slate-800/50">
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {metrics?.revisionDueCount || 0}
                                    </p>
                                    <p className="text-xs text-slate-400">Revisions Due</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900/50 border-slate-800/50">
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {metrics?.overallProgress || 0}%
                                    </p>
                                    <p className="text-xs text-slate-400">Overall Progress</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-slate-900/50 border-slate-800/50">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <Lock className="w-5 h-5 text-red-400" />
                                Focus Areas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {incompleteSubjects.length === 0 ? (
                                <p className="text-green-400 text-center py-4">
                                    All subjects are complete. You are ready!
                                </p>
                            ) : (
                                incompleteSubjects.map((subject: {
                                    _id: string; name: string; icon: string; color: string;
                                    progress: number; notStarted: number; inProgress: number;
                                }) => (
                                    <div
                                        key={subject._id}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                            style={{ backgroundColor: `${subject.color}20` }}
                                        >
                                            {subject.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">{subject.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden max-w-[200px]">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${subject.progress}%`,
                                                            backgroundColor: subject.color,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-500">{subject.progress}%</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {subject.notStarted > 0 && (
                                                <Badge variant="outline" className="border-gray-500/20 text-gray-400 text-[10px]">
                                                    {subject.notStarted} not started
                                                </Badge>
                                            )}
                                            {subject.inProgress > 0 && (
                                                <Badge variant="outline" className="border-yellow-500/20 text-yellow-400 text-[10px]">
                                                    {subject.inProgress} in progress
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
