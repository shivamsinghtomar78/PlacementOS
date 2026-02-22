"use client";

import { memo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { AlertTriangle, BookOpen, CheckCircle2, Clock, Flame, Layers, Target, TrendingUp } from "lucide-react";

import { apiClient } from "@/lib/api-client";
import { getClientScopeKey } from "@/lib/track-context";
import { useAuth } from "@/contexts/AuthContext";
import { pusherClient } from "@/lib/pusher-client";
import { APP_CARD_CLASS } from "@/lib/ui-tokens";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NumberTicker from "@/components/ui/number-ticker";
import { Skeleton } from "@/components/ui/skeleton";

type SubjectProgress = {
  _id: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  completed: number;
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

const HeatmapCalendar = memo(({ data }: { data: { date: string; count: number }[] }) => {
  const weeks = 52;
  const days = 7;
  const cellSize = 11;
  const dataMap = new Map(data.map((entry) => [new Date(entry.date).toDateString(), entry.count]));
  const today = new Date();
  const cells = [];

  const getColor = (count: number) => {
    if (count === 0) return "bg-slate-800";
    if (count <= 1) return "bg-indigo-500/30";
    if (count <= 3) return "bg-indigo-500/55";
    return "bg-indigo-400";
  };

  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 0; d < days; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      const count = dataMap.get(date.toDateString()) || 0;
      cells.push({ date, count, week: weeks - 1 - w, day: d });
    }
  }

  return (
    <div className="overflow-x-auto pb-1">
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
            title={`${format(cell.date, "MMM d, yyyy")}: ${cell.count} completed`}
            className={cn("rounded-[2px]", getColor(cell.count))}
            style={{
              width: cellSize,
              height: cellSize,
              gridColumn: cell.week + 1,
              gridRow: cell.day + 1,
            }}
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 bg-slate-800/60" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-slate-800/60" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl bg-slate-800/60" />
          <Skeleton className="h-72 rounded-xl bg-slate-800/60" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="border-red-500/30 bg-red-500/10">
        <CardContent className="pt-5">
          <p className="text-red-300 font-medium">Failed to load dashboard data.</p>
          <p className="text-sm text-red-200/80 mt-1">
            {error instanceof Error ? error.message : "Please refresh the page."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const metrics = data.metrics;
  const subjectProgress = (data.subjectProgress || []) as SubjectProgress[];
  const weeklyStats = data.weeklyStats || [];
  const heatmapData = data.heatmapData || [];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Target className="h-6 w-6 text-indigo-300" />}
        title="Dashboard"
        subtitle={
          metrics?.track === "sarkari"
            ? `Department: ${(metrics?.department || "mechanical").toUpperCase()}`
            : "Track completion and revision health across your preparation plan."
        }
        right={
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wide",
              metrics?.track === "sarkari"
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                : "border-indigo-500/30 bg-indigo-500/15 text-indigo-300"
            )}
          >
            {metrics?.track === "sarkari" ? "Sarkari Mode" : "Placement Mode"}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          {
            label: "Overall Progress",
            value: metrics?.overallProgress || 0,
            suffix: "%",
            icon: TrendingUp,
            tone: "text-indigo-300",
          },
          {
            label: "Subjects",
            value: metrics?.totalSubjects || 0,
            suffix: "",
            icon: BookOpen,
            tone: "text-blue-300",
          },
          {
            label: "Topics",
            value: metrics?.totalTopics || 0,
            suffix: "",
            icon: Layers,
            tone: "text-cyan-300",
          },
          {
            label: "Mastered",
            value: metrics?.completedSubtopics || 0,
            suffix: "",
            icon: CheckCircle2,
            tone: "text-emerald-300",
          },
          {
            label: "Revision Due",
            value: metrics?.revisionDueCount || 0,
            suffix: "",
            icon: Clock,
            tone: "text-amber-300",
          },
          {
            label: "Streak",
            value: metrics?.streak || 0,
            suffix: " days",
            icon: Flame,
            tone: "text-orange-300",
          },
        ].map((item) => (
          <Card key={item.label} className={APP_CARD_CLASS}>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <item.icon className={cn("h-4.5 w-4.5", item.tone)} />
                <p className="text-[11px] uppercase tracking-[0.13em] text-slate-500">{item.label}</p>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">
                <NumberTicker value={item.value} className="text-white" />
                {item.suffix}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {metrics?.weakestSubject ? (
        <Card className="border border-red-500/25 bg-red-500/8">
          <CardContent className="flex items-center gap-3 pt-4 pb-4">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-red-500/20">
              <AlertTriangle className="h-4.5 w-4.5 text-red-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-red-300/90">Needs Attention</p>
              <p className="text-sm text-slate-200 mt-0.5">
                {metrics.weakestSubject.icon} {metrics.weakestSubject.name} - {metrics.weakestSubject.progress}% mastery
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className={APP_CARD_CLASS}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Subject Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjectProgress.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No subjects yet. Add subjects to begin tracking.</p>
            ) : (
              subjectProgress.map((subject) => (
                <div key={subject._id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-200">
                      <span>{subject.icon}</span>
                      <span>{subject.name}</span>
                    </span>
                    <span className="text-slate-400">
                      {subject.completed}/{subject.total} ({subject.progress}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${subject.progress}%`, backgroundColor: subject.color }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className={APP_CARD_CLASS}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyStats.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">Complete subtopics to generate trend analytics.</p>
            ) : (
              <PerformanceTrendChart data={weeklyStats} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className={cn(APP_CARD_CLASS, "lg:col-span-2")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Activity Consistency</CardTitle>
          </CardHeader>
          <CardContent>
            <HeatmapCalendar data={heatmapData} />
          </CardContent>
        </Card>

        <Card className={APP_CARD_CLASS}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Curriculum Focus</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectProgress.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No data yet.</p>
            ) : (
              <CurriculumFocusChart data={subjectProgress} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

