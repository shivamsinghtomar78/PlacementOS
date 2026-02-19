"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { pusherClient } from "@/lib/pusher-client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
    BarChart3,
    AlertTriangle,
    Clock,
    TrendingDown,
    Target,
    Brain,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from "recharts";
import { getClientScopeKey } from "@/lib/track-context";

export default function AnalyticsPage() {
    const queryClient = useQueryClient();
    const { dbUser } = useAuth();
    const scopeKey = getClientScopeKey(dbUser?.preferences);

    const { data, isLoading } = useQuery({
        queryKey: ["dashboard", scopeKey],
        queryFn: async () => {
            const res = await apiClient("/api/dashboard");
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
    });

    useEffect(() => {
        if (!dbUser?._id || !pusherClient) return;

        const channel = pusherClient.subscribe(`user-${dbUser._id}`);
        channel.bind("dashboard-update", () => {
            queryClient.invalidateQueries({ queryKey: ["dashboard", scopeKey] });
        });

        return () => {
            pusherClient?.unsubscribe(`user-${dbUser._id}`);
        };
    }, [dbUser?._id, queryClient, scopeKey]);

    const subjectProgress = data?.subjectProgress || [];
    const metrics = data?.metrics;

    // Weak areas: subjects with < 50% completion
    const weakAreas = subjectProgress
        .filter((s: { progress: number; total: number }) => s.total > 0 && s.progress < 50)
        .sort((a: { progress: number }, b: { progress: number }) => a.progress - b.progress);

    // Recommendations based on data analysis
    const recommendations = [];
    if (weakAreas.length > 0) {
        recommendations.push({
            icon: AlertTriangle,
            title: "Focus on Weak Subjects",
            description: `You have ${weakAreas.length} subjects with less than 50% completion. Prioritize ${weakAreas[0]?.name} (${weakAreas[0]?.progress}%).`,
            color: "text-red-400",
            bg: "bg-red-500/10",
        });
    }
    if (metrics?.revisionDueCount > 0) {
        recommendations.push({
            icon: Clock,
            title: "Revision Overdue",
            description: `You have ${metrics.revisionDueCount} subtopics overdue for revision. Complete them to improve retention.`,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
        });
    }
    if (metrics?.streak === 0) {
        recommendations.push({
            icon: Target,
            title: "Build Your Streak",
            description: "You haven't completed any subtopics today. Complete at least one to start your streak!",
            color: "text-orange-400",
            bg: "bg-orange-500/10",
        });
    }
    if (metrics?.overallProgress > 70) {
        recommendations.push({
            icon: Brain,
            title: "You're Doing Great!",
            description: `${metrics.overallProgress}% completed — consider switching to Placement Mode for focused revision.`,
            color: "text-green-400",
            bg: "bg-green-500/10",
        });
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48 bg-slate-800/50" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-48 rounded-2xl bg-slate-800/50" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-indigo-400" />
                    Analytics & Insights
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    AI-powered analysis of your preparation progress
                </p>
            </div>

            {/* AI Recommendations */}
            {recommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recommendations.map((rec, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className={`${rec.bg} border-slate-800/50`}>
                                <CardContent className="pt-4 pb-4 flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${rec.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                        <rec.icon className={`w-4 h-4 ${rec.color}`} />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${rec.color}`}>{rec.title}</p>
                                        <p className="text-xs text-slate-400 mt-1">{rec.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Subject Completion Chart */}
            <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-indigo-400" />
                        Subject Completion Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {subjectProgress.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No data yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={subjectProgress.map((s: { name: string; completed: number; inProgress: number; notStarted: number }) => ({
                                    name: s.name.length > 12 ? s.name.slice(0, 12) + "..." : s.name,
                                    Mastered: s.completed,
                                    "In Progress": s.inProgress,
                                    "Not Started": s.notStarted,
                                }))}
                                layout="vertical"
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis type="number" stroke="#475569" tick={{ fontSize: 10 }} />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    stroke="#475569"
                                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                                    width={100}
                                />
                                <RechartsTooltip
                                    contentStyle={{
                                        backgroundColor: "#1e293b",
                                        border: "1px solid #334155",
                                        borderRadius: "12px",
                                        color: "#fff",
                                    }}
                                />
                                <Bar dataKey="Mastered" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="In Progress" stackId="a" fill="#eab308" />
                                <Bar dataKey="Not Started" stackId="a" fill="#475569" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Weak Areas List */}
            <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Weak Areas ({weakAreas.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {weakAreas.length === 0 ? (
                        <p className="text-green-400 text-sm text-center py-4">
                            🎉 No weak areas! All subjects are above 50% completion.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {weakAreas.map((subject: { _id: string; name: string; icon: string; progress: number; total: number; completed: number; color: string }) => (
                                <div
                                    key={subject._id}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10"
                                >
                                    <span className="text-lg">{subject.icon}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{subject.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {subject.completed}/{subject.total} subtopics completed
                                        </p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="border-red-500/20 text-red-400"
                                    >
                                        {subject.progress}%
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
