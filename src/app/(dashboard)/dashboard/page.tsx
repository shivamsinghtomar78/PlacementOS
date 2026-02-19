"use client";

import { useEffect, memo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { pusherClient } from "@/lib/pusher-client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    BookOpen,
    Layers,
    CheckCircle,
    Flame,
    AlertTriangle,
    TrendingUp,
    Clock,
    Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import { getClientScopeKey } from "@/lib/track-context";

type SubjectProgress = {
    _id: string;
    name: string;
    icon: string;
    color: string;
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    progress: number;
};

const PerformanceTrendChart = dynamic(
    () => import("@/components/dashboard/PerformanceTrendChart"),
    { ssr: false, loading: () => <Skeleton className="h-[220px] w-full bg-slate-800/50" /> }
);

const CurriculumFocusChart = dynamic(
    () => import("@/components/dashboard/CurriculumFocusChart"),
    { ssr: false, loading: () => <Skeleton className="h-[230px] w-full bg-slate-800/50" /> }
);

// Animated number counter
function AnimatedNumber({ value }: { value: number }) {
    return (
        <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={value}
        >
            {value}
        </motion.span>
    );
}

// Circular progress component
function CircularProgress({ progress, size = 120, strokeWidth = 10 }: {
    progress: number;
    size?: number;
    strokeWidth?: number;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-slate-900/40"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#premiumGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
                    transition={{ duration: 2, ease: "circOut" }}
                />
                <defs>
                    <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-white tracking-tighter drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">{progress}%</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">Mastery</span>
            </div>
        </div>
    );
}

// Heatmap calendar
const HeatmapCalendar = memo(({ data }: { data: { date: string; count: number }[] }) => {
    const weeks = 52;
    const days = 7;
    const cellSize = 12;

    const getColor = (count: number) => {
        if (count === 0) return "bg-white/[0.02]";
        if (count <= 1) return "bg-indigo-500/20";
        if (count <= 3) return "bg-indigo-500/40";
        if (count <= 5) return "bg-indigo-500/60";
        return "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]";
    };

    const dataMap = new Map(data.map((d) => [new Date(d.date).toDateString(), d.count]));
    const cells = [];
    const today = new Date();

    for (let w = weeks - 1; w >= 0; w--) {
        for (let d = 0; d < days; d++) {
            const date = new Date(today);
            date.setDate(date.getDate() - (w * 7 + (6 - d)));
            const count = dataMap.get(date.toDateString()) || 0;
            cells.push({ date, count, week: weeks - 1 - w, day: d });
        }
    }

    return (
        <div className="overflow-x-auto custom-scrollbar pb-2">
            <div
                className="grid gap-[3px]"
                style={{
                    gridTemplateColumns: `repeat(${weeks}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${days}, ${cellSize}px)`,
                }}
            >
                {cells.map((cell, i) => (
                    <div
                        key={i}
                        className={`rounded-[2px] ${getColor(cell.count)} transition-all duration-300 hover:scale-150 hover:z-10 cursor-pointer`}
                        style={{
                            width: cellSize,
                            height: cellSize,
                            gridColumn: cell.week + 1,
                            gridRow: cell.day + 1,
                        }}
                        title={`${format(cell.date, "MMM d, yyyy")}: ${cell.count} completed`}
                    />
                ))}
            </div>
        </div>
    );
});

HeatmapCalendar.displayName = "HeatmapCalendar";

export default function DashboardPage() {
    const queryClient = useQueryClient();
    const { dbUser, user } = useAuth();
    const scopeKey = getClientScopeKey(dbUser?.preferences);

    const { data, isLoading, error } = useQuery({
        queryKey: ["dashboard", scopeKey],
        queryFn: async () => {
            const res = await apiClient("/api/dashboard");
            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload?.error || `Failed to fetch dashboard (${res.status})`);
            }
            return res.json();
        },
        enabled: !!dbUser?._id && !!user,
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    });
    const isError = !isLoading && !data;

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

    const stagger = {
        animate: { transition: { staggerChildren: 0.1 } },
    };

    const fadeUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl bg-slate-800/50" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Skeleton className="h-64 rounded-2xl bg-slate-800/50" />
                    <Skeleton className="h-64 rounded-2xl bg-slate-800/50" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                <p className="text-red-300 font-medium">Failed to load dashboard data.</p>
                <p className="text-red-200/80 text-sm mt-1">
                    {error instanceof Error ? error.message : "Please refresh the page. If this persists, check API logs."}
                </p>
            </div>
        );
    }

    const metrics = data?.metrics;
    const subjectProgress = data?.subjectProgress || [];
    const weeklyStats = data?.weeklyStats || [];
    const heatmapData = data?.heatmapData || [];

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-transparent px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h1 className="text-2xl font-bold text-white">Control Center</h1>
                        <span className={cn(
                            "text-[10px] uppercase tracking-wider border rounded-full px-2.5 py-1",
                            metrics?.track === "sarkari"
                                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                                : "border-indigo-500/30 bg-indigo-500/15 text-indigo-300"
                        )}>
                            {metrics?.track === "sarkari" ? "Sarkari Mode" : "Placement Mode"}
                        </span>
                    </div>
                    <p className="text-slate-400 text-sm">
                        {metrics?.track === "sarkari"
                            ? `Department: ${(metrics?.department || "mechanical").toUpperCase()}`
                            : "Track your placement preparation progress"}
                    </p>
                </div>
            </motion.div>

            {/* Metrics Grid */}
            <motion.div
                variants={stagger}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
            >
                {/* Overall Progress */}
                <motion.div {...fadeUp} className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                    <Card className="glass-morphism bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-white/5 h-full group hover:bg-white/[0.07] transition-colors duration-500 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                        <CardContent className="pt-6 flex items-center justify-center gap-8 relative z-10">
                            <CircularProgress progress={metrics?.overallProgress || 0} />
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">Global Progress</p>
                                <p className="text-3xl font-bold text-white tracking-tighter">
                                    <AnimatedNumber value={metrics?.completedSubtopics || 0} />
                                    <span className="text-slate-500 text-lg">/{metrics?.totalSubtopics || 0}</span>
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500/80" />
                                    <p className="text-xs text-indigo-400/80 font-medium">Mastering topics</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stat Cards */}
                {[
                    {
                        label: "Subjects",
                        value: metrics?.totalSubjects || 0,
                        icon: BookOpen,
                        color: "text-blue-400",
                        bgColor: "from-blue-500/10 to-blue-500/5",
                        glow: "shadow-blue-500/10",
                    },
                    {
                        label: "Topics",
                        value: metrics?.totalTopics || 0,
                        icon: Layers,
                        color: "text-emerald-400",
                        bgColor: "from-emerald-500/10 to-emerald-500/5",
                        glow: "shadow-emerald-500/10",
                    },
                    {
                        label: "Mastered",
                        value: metrics?.completedSubtopics || 0,
                        icon: CheckCircle,
                        color: "text-green-400",
                        bgColor: "from-green-500/10 to-green-500/5",
                        glow: "shadow-green-500/10",
                    },
                    {
                        label: "Streak",
                        value: `${metrics?.streak || 0} days`,
                        icon: Flame,
                        color: "text-orange-400",
                        bgColor: "from-orange-500/10 to-orange-500/5",
                        glow: "shadow-orange-500/10",
                    },
                ].map((card, i) => (
                    <motion.div key={card.label} {...fadeUp} transition={{ delay: 0.1 * (i + 1) }} className="h-full">
                        <Card className={cn(
                            "glass-morphism h-full group hover:bg-white/[0.07] transition-all duration-300 border-white/5",
                            card.glow
                        )}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn("p-2 rounded-xl bg-white/[0.03] transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/[0.05]", card.color)}>
                                        <card.icon className="w-5 h-5" />
                                    </div>
                                    <TrendingUp className="w-3.5 h-3.5 text-slate-600 transition-colors group-hover:text-slate-400" />
                                </div>
                                <p className="text-2xl font-bold text-white tracking-tight group-hover:text-glow transition-all">{card.value}</p>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 mt-1">{card.label}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Weakest Subject Alert */}
            {metrics?.weakestSubject && (
                <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
                    <Card className="glass-morphism bg-gradient-to-r from-red-500/5 to-orange-500/5 border-red-500/20 shadow-red-500/5 relative overflow-hidden group">
                        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="pt-4 pb-4 flex items-center gap-4 relative z-10">
                            <motion.div
                                animate={{ scale: [1, 1.04, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center neo-glow"
                            >
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </motion.div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-400/80">Critical Attention Required</p>
                                <p className="text-white font-semibold flex items-center gap-2 mt-0.5">
                                    <span className="text-xl">{metrics.weakestSubject.icon}</span>
                                    {metrics.weakestSubject.name}
                                    <span className="text-red-400/60 ml-2 font-medium">
                                        • {metrics.weakestSubject.progress}% Mastery
                                    </span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 [content-visibility:auto] [contain-intrinsic-size:540px]">
                {/* Subject Progress Bars */}
                <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
                    <Card className="glass-morphism bg-slate-900/40 border-white/5 overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-lg flex items-center gap-2 group">
                                <Target className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                                Subject Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {subjectProgress.length === 0 ? (
                                <p className="text-slate-500 text-sm text-center py-8">
                                    No subjects yet. Create your first subject to see progress!
                                </p>
                            ) : (
                                subjectProgress.map((subject: SubjectProgress, idx: number) => (
                                    <div key={subject._id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white/90 font-medium flex items-center gap-2">
                                                <span className="text-xl">{subject.icon}</span>
                                                {subject.name}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                                                {subject.completed}/{subject.total} <span className="text-white/60 ml-2">{subject.progress}%</span>
                                            </span>
                                        </div>
                                        <div className="h-2.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05] p-[2px]">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${subject.progress}%` }}
                                                transition={{ duration: 1.5, ease: "circOut", delay: 0.5 + (idx * 0.1) }}
                                                className="h-full rounded-full relative group"
                                                style={{
                                                    backgroundColor: subject.color,
                                                    boxShadow: `0 0 15px ${subject.color}40`
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-50" />
                                            </motion.div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Weekly Completion Chart */}
                <motion.div {...fadeUp} transition={{ delay: 0.5 }}>
                    <Card className="glass-morphism bg-slate-900/40 border-white/5 overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-lg flex items-center gap-2 group">
                                <TrendingUp className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                                Performance Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {weeklyStats.length === 0 ? (
                                <p className="text-slate-500 text-sm text-center py-8">
                                    Start completing subtopics to see your weekly trend!
                                </p>
                            ) : (
                                <PerformanceTrendChart data={weeklyStats} />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Heatmap + Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 [content-visibility:auto] [contain-intrinsic-size:460px]">
                {/* Activity Heatmap */}
                <motion.div {...fadeUp} transition={{ delay: 0.6 }} className="lg:col-span-2">
                    <Card className="glass-morphism bg-slate-900/40 border-white/5 h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-lg flex items-center gap-2 group">
                                <Clock className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
                                Activity Consistency
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <HeatmapCalendar data={heatmapData} />
                            <div className="flex items-center justify-end gap-2 mt-4 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                                <span>Sparse</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded-[2px] bg-white/[0.02]" />
                                    <div className="w-3 h-3 rounded-[2px] bg-indigo-500/20" />
                                    <div className="w-3 h-3 rounded-[2px] bg-indigo-500/40" />
                                    <div className="w-3 h-3 rounded-[2px] bg-indigo-500/60" />
                                    <div className="w-3 h-3 rounded-[2px] bg-indigo-500" />
                                </div>
                                <span>Dense</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Subject Distribution Pie */}
                <motion.div {...fadeUp} transition={{ delay: 0.7 }}>
                    <Card className="glass-morphism bg-slate-900/40 border-white/5 h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-lg">Curriculum Focus</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {subjectProgress.length === 0 ? (
                                <p className="text-slate-500 text-sm text-center py-8">No data yet</p>
                            ) : (
                                <CurriculumFocusChart data={subjectProgress} />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
