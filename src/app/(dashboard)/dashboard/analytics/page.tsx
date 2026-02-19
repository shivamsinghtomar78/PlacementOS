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
import { getClientScopeKey } from "@/lib/track-context";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/common/page-header";
import { APP_CARD_CLASS } from "@/lib/ui-tokens";

const SubjectCompletionChart = dynamic(
    () => import("@/components/dashboard/SubjectCompletionChart"),
    { ssr: false, loading: () => <Skeleton className="h-[300px] w-full bg-slate-800/50" /> }
);

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
        enabled: !!dbUser?._id,
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
            description: `${metrics.overallProgress}% completed - consider switching to Placement Mode for focused revision.`,
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
            <PageHeader
                icon={<BarChart3 className="w-6 h-6 text-indigo-400" />}
                title="Analytics & Insights"
                subtitle="AI-powered analysis of your preparation progress"
            />

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
            <Card className={APP_CARD_CLASS}>
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
                        <SubjectCompletionChart data={subjectProgress} />
                    )}
                </CardContent>
            </Card>

            {/* Weak Areas List */}
            <Card className={APP_CARD_CLASS}>
                <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Weak Areas ({weakAreas.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {weakAreas.length === 0 ? (
                        <p className="text-green-400 text-sm text-center py-4">
                            No weak areas. All subjects are above 50% completion.
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
