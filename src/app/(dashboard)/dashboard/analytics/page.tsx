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
    CircleHelp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getClientScopeKey } from "@/lib/track-context";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/common/page-header";
import { APP_CARD_CLASS } from "@/lib/ui-tokens";
import NumberTicker from "@/components/ui/number-ticker";
import { SectionReveal } from "@/components/common/section-reveal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const SubjectCompletionChart = dynamic(
    () => import("@/components/dashboard/SubjectCompletionChart"),
    { ssr: false, loading: () => <Skeleton className="h-[300px] w-full bg-slate-800/50" /> }
);

export default function AnalyticsPage() {
    const queryClient = useQueryClient();
    const { dbUser, user } = useAuth();
    const scopeKey = getClientScopeKey(dbUser?.preferences);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["dashboard", scopeKey],
        queryFn: async () => {
            const res = await apiClient("/api/dashboard");
            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload?.error || `Failed to fetch analytics (${res.status})`);
            }
            return res.json();
        },
        enabled: !!dbUser?._id && !!user,
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
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

    if (isError) {
        return (
            <div className="space-y-4">
                <PageHeader
                    icon={<BarChart3 className="w-6 h-6 text-indigo-400" />}
                    title="Analytics & Insights"
                    subtitle="AI-powered analysis of your preparation progress"
                    typewriterWords={[
                        { text: "Analytics" },
                        { text: "Insights", className: "text-indigo-300" },
                    ]}
                    helpText="Use this panel to identify weak subjects, overdue revisions, and targeted next actions."
                    right={
                        <Badge className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            <NumberTicker value={weakAreas.length} className="text-indigo-200 mr-1" /> weak areas
                        </Badge>
                    }
                />
                <Card className="border-red-500/20 bg-red-500/5">
                    <CardContent className="pt-5 pb-5">
                        <p className="text-red-300 font-medium">Failed to load analytics data.</p>
                        <p className="text-red-200/80 text-sm mt-1">
                            {error instanceof Error ? error.message : "Please refresh. If issue persists, check `/api/dashboard` logs."}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                icon={<BarChart3 className="w-6 h-6 text-indigo-400" />}
                title="Analytics & Insights"
                subtitle="AI-powered analysis of your preparation progress"
                typewriterWords={[
                    { text: "Analytics" },
                    { text: "Insights", className: "text-indigo-300" },
                ]}
                helpText="Recommendations below are generated from your completion trend, streak state, and revision load."
                right={
                    <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            <NumberTicker value={weakAreas.length} className="text-indigo-200 mr-1" /> weak areas
                        </Badge>
                        <Badge className="bg-slate-900/70 text-slate-300 border border-slate-700">
                            <NumberTicker value={metrics?.overallProgress || 0} className="text-slate-100 mr-1" />% complete
                        </Badge>
                    </div>
                }
            />

            {/* AI Recommendations */}
            {recommendations.length > 0 && (
                <SectionReveal className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                </SectionReveal>
            )}

            {/* Subject Completion Chart */}
            <SectionReveal>
                <Card className={APP_CARD_CLASS}>
                    <CardHeader>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-indigo-400" />
                            Subject Completion Analysis
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button type="button" className="text-slate-500 hover:text-slate-300" aria-label="Analysis help">
                                        <CircleHelp className="w-4 h-4" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="border-slate-700 bg-slate-900 text-slate-200 text-xs">
                                    This chart compares subject-level completion to reveal where your preparation is lagging.
                                </PopoverContent>
                            </Popover>
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
            </SectionReveal>

            {/* Weak Areas List */}
            <SectionReveal>
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
            </SectionReveal>
        </div>
    );
}
