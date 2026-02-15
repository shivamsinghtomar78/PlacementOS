"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
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
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { format } from "date-fns";

// Animated number counter
function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
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
                    className="text-slate-800"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-white">{progress}%</span>
                <span className="text-xs text-slate-400">Complete</span>
            </div>
        </div>
    );
}

// Heatmap calendar
function HeatmapCalendar({ data }: { data: { date: string; count: number }[] }) {
    const weeks = 52;
    const days = 7;
    const cellSize = 12;
    const gap = 2;

    const getColor = (count: number) => {
        if (count === 0) return "bg-slate-800/50";
        if (count <= 1) return "bg-indigo-900/60";
        if (count <= 3) return "bg-indigo-700/70";
        if (count <= 5) return "bg-indigo-500/80";
        return "bg-indigo-400";
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
        <div className="overflow-x-auto">
            <div
                className="grid gap-[2px]"
                style={{
                    gridTemplateColumns: `repeat(${weeks}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${days}, ${cellSize}px)`,
                }}
            >
                {cells.map((cell, i) => (
                    <div
                        key={i}
                        className={`rounded-sm ${getColor(cell.count)} transition-colors`}
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
}

export default function DashboardPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => {
            const res = await apiClient("/api/dashboard");
            if (!res.ok) throw new Error("Failed to fetch dashboard");
            return res.json();
        },
    });

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

    const metrics = data?.metrics;
    const subjectProgress = data?.subjectProgress || [];
    const weeklyStats = data?.weeklyStats || [];
    const heatmapData = data?.heatmapData || [];

    const PIE_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8", "#6ee7b7"];

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-white">Control Center</h1>
                <p className="text-slate-400 text-sm mt-1">
                    Track your placement preparation progress
                </p>
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
                    <Card className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/20 h-full">
                        <CardContent className="pt-6 flex items-center justify-center gap-6">
                            <CircularProgress progress={metrics?.overallProgress || 0} />
                            <div>
                                <p className="text-sm text-slate-400">Overall Progress</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    <AnimatedNumber value={metrics?.completedSubtopics || 0} />
                                    <span className="text-slate-500 text-base">/{metrics?.totalSubtopics || 0}</span>
                                </p>
                                <p className="text-xs text-indigo-400 mt-1">subtopics mastered</p>
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
                        borderColor: "border-blue-500/20",
                    },
                    {
                        label: "Topics",
                        value: metrics?.totalTopics || 0,
                        icon: Layers,
                        color: "text-emerald-400",
                        bgColor: "from-emerald-500/10 to-emerald-500/5",
                        borderColor: "border-emerald-500/20",
                    },
                    {
                        label: "Mastered",
                        value: metrics?.completedSubtopics || 0,
                        icon: CheckCircle,
                        color: "text-green-400",
                        bgColor: "from-green-500/10 to-green-500/5",
                        borderColor: "border-green-500/20",
                    },
                    {
                        label: "Streak",
                        value: `${metrics?.streak || 0} days`,
                        icon: Flame,
                        color: "text-orange-400",
                        bgColor: "from-orange-500/10 to-orange-500/5",
                        borderColor: "border-orange-500/20",
                    },
                ].map((card, i) => (
                    <motion.div key={card.label} {...fadeUp} transition={{ delay: 0.1 * (i + 1) }}>
                        <Card className={`bg-gradient-to-br ${card.bgColor} ${card.borderColor} h-full`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <card.icon className={`w-5 h-5 ${card.color}`} />
                                    <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                                </div>
                                <p className="text-2xl font-bold text-white">{card.value}</p>
                                <p className="text-xs text-slate-400 mt-1">{card.label}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Weakest Subject Alert */}
            {metrics?.weakestSubject && (
                <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
                    <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
                        <CardContent className="pt-4 pb-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-red-400">Weakest Subject</p>
                                <p className="text-white font-semibold">
                                    {metrics.weakestSubject.icon} {metrics.weakestSubject.name}
                                    <span className="text-red-400 ml-2">
                                        ({metrics.weakestSubject.progress}% complete)
                                    </span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Subject Progress Bars */}
                <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
                    <Card className="bg-slate-900/50 border-slate-800/50">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-400" />
                                Subject Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {subjectProgress.length === 0 ? (
                                <p className="text-slate-500 text-sm text-center py-8">
                                    No subjects yet. Create your first subject to see progress!
                                </p>
                            ) : (
                                subjectProgress.map((subject: {
                                    _id: string; name: string; icon: string; color: string;
                                    progress: number; completed: number; total: number;
                                }) => (
                                    <div key={subject._id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white flex items-center gap-2">
                                                <span>{subject.icon}</span>
                                                {subject.name}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {subject.completed}/{subject.total} ({subject.progress}%)
                                            </span>
                                        </div>
                                        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${subject.progress}%` }}
                                                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: subject.color }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Weekly Completion Chart */}
                <motion.div {...fadeUp} transition={{ delay: 0.5 }}>
                    <Card className="bg-slate-900/50 border-slate-800/50">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-400" />
                                Weekly Completion
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {weeklyStats.length === 0 ? (
                                <p className="text-slate-500 text-sm text-center py-8">
                                    Start completing subtopics to see your weekly trend!
                                </p>
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={weeklyStats}>
                                        <defs>
                                            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#475569"
                                            tick={{ fontSize: 10 }}
                                            tickFormatter={(v) => format(new Date(v), "MMM d")}
                                        />
                                        <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                                        <RechartsTooltip
                                            contentStyle={{
                                                backgroundColor: "#1e293b",
                                                border: "1px solid #334155",
                                                borderRadius: "12px",
                                                color: "#fff",
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="completed"
                                            stroke="#6366f1"
                                            fillOpacity={1}
                                            fill="url(#colorCompleted)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Heatmap + Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Activity Heatmap */}
                <motion.div {...fadeUp} transition={{ delay: 0.6 }} className="lg:col-span-2">
                    <Card className="bg-slate-900/50 border-slate-800/50">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-400" />
                                Activity Heatmap
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <HeatmapCalendar data={heatmapData} />
                            <div className="flex items-center justify-end gap-1 mt-3 text-xs text-slate-500">
                                <span>Less</span>
                                <div className="w-3 h-3 rounded-sm bg-slate-800/50" />
                                <div className="w-3 h-3 rounded-sm bg-indigo-900/60" />
                                <div className="w-3 h-3 rounded-sm bg-indigo-700/70" />
                                <div className="w-3 h-3 rounded-sm bg-indigo-500/80" />
                                <div className="w-3 h-3 rounded-sm bg-indigo-400" />
                                <span>More</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Subject Distribution Pie */}
                <motion.div {...fadeUp} transition={{ delay: 0.7 }}>
                    <Card className="bg-slate-900/50 border-slate-800/50">
                        <CardHeader>
                            <CardTitle className="text-white text-lg">Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {subjectProgress.length === 0 ? (
                                <p className="text-slate-500 text-sm text-center py-8">No data yet</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={subjectProgress.map((s: { name: string; total: number }) => ({
                                                name: s.name,
                                                value: s.total || 1,
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {subjectProgress.map((_: unknown, i: number) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{
                                                backgroundColor: "#1e293b",
                                                border: "1px solid #334155",
                                                borderRadius: "12px",
                                                color: "#fff",
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
