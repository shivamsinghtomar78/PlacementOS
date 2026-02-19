import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";
import Subject from "@/models/Subject";
import Topic from "@/models/Topic";
import Subtopic from "@/models/Subtopic";
import DailyProgress from "@/models/DailyProgress";
import { getScopedFilter, getTrackContextFromUser } from "@/lib/track-context";

export const dynamic = "force-dynamic";

type DailyStat = {
    date: Date;
    subtopicsCompleted: number;
    timeSpent: number;
};

export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        const context = getTrackContextFromUser(authUser);
        const scope = getScopedFilter(authUser._id, context);

        await dbConnect();

        const [subjectProgressAgg, subjects, topicCount] = await Promise.all([
            Subtopic.aggregate([
                { $match: scope },
                {
                    $group: {
                        _id: { subjectId: "$subjectId", status: "$status" },
                        count: { $sum: 1 },
                    },
                },
            ]),
            Subject.find(scope).sort({ order: 1 }).lean(),
            Topic.countDocuments(scope),
        ]);

        const subjectStatsMap = new Map<string, { total: number; completed: number; inProgress: number }>();
        for (const row of subjectProgressAgg) {
            const sid = row._id.subjectId.toString();
            if (!subjectStatsMap.has(sid)) {
                subjectStatsMap.set(sid, { total: 0, completed: 0, inProgress: 0 });
            }
            const stats = subjectStatsMap.get(sid)!;
            stats.total += row.count;
            if (row._id.status === 2) stats.completed += row.count;
            if (row._id.status === 1) stats.inProgress += row.count;
        }

        let totalSubtopics = 0;
        let completedSubtopics = 0;
        let inProgressSubtopics = 0;

        const subjectProgress = subjects.map((subject) => {
            const sid = subject._id.toString();
            const stats = subjectStatsMap.get(sid) || { total: 0, completed: 0, inProgress: 0 };
            totalSubtopics += stats.total;
            completedSubtopics += stats.completed;
            inProgressSubtopics += stats.inProgress;
            return {
                _id: subject._id,
                name: subject.name,
                icon: subject.icon,
                color: subject.color,
                total: stats.total,
                completed: stats.completed,
                inProgress: stats.inProgress,
                notStarted: stats.total - stats.completed - stats.inProgress,
                progress: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
            };
        });

        const overallProgress = totalSubtopics > 0
            ? Math.round((completedSubtopics / totalSubtopics) * 100)
            : 0;

        const weakestSubject = subjectProgress
            .filter((s) => s.total > 0)
            .sort((a, b) => a.progress - b.progress)[0] || null;

        const now = new Date();
        const revisionCandidates = await Subtopic.find(
            {
                ...scope,
                "revision.learnedDate": { $exists: true, $ne: null },
            },
            { revision: 1 }
        ).lean();

        const revisionDueCount = revisionCandidates.reduce((count, item) => {
            const learnedDate = item.revision?.learnedDate;
            if (!learnedDate) return count;

            const daysSinceLearned = Math.floor(
                (now.getTime() - new Date(learnedDate).getTime()) / (1000 * 60 * 60 * 24)
            );

            const due =
                (!item.revision?.revised1 && daysSinceLearned >= 1) ||
                (!item.revision?.revised2 && daysSinceLearned >= 3) ||
                (!item.revision?.revised3 && daysSinceLearned >= 7) ||
                (!item.revision?.finalRevised && daysSinceLearned >= 30);

            return due ? count + 1 : count;
        }, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yearAgo = new Date(today);
        yearAgo.setDate(yearAgo.getDate() - 365);

        const heatmapData = await DailyProgress.find({
            ...scope,
            date: { $gte: yearAgo },
        }).sort({ date: -1 }).lean();

        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dailyStats = heatmapData
            .filter((d) => new Date(d.date) >= thirtyDaysAgo)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let streak = 0;
        const streakDates = new Set(
            heatmapData
                .filter((d) => d.subtopicsCompleted > 0)
                .map((d) => {
                    const date = new Date(d.date);
                    date.setHours(0, 0, 0, 0);
                    return date.getTime();
                })
        );

        const checkDate = new Date(today);
        checkDate.setHours(0, 0, 0, 0);

        if (!streakDates.has(checkDate.getTime())) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (streakDates.has(checkDate.getTime())) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        return NextResponse.json({
            metrics: {
                track: context.track,
                department: context.department,
                overallProgress,
                totalSubjects: subjects.length,
                totalTopics: topicCount,
                totalSubtopics,
                completedSubtopics,
                inProgressSubtopics,
                streak,
                weakestSubject,
                revisionDueCount,
            },
            subjectProgress,
            weeklyStats: dailyStats.map((d: DailyStat) => ({
                date: d.date,
                completed: d.subtopicsCompleted,
                timeSpent: d.timeSpent,
            })),
            heatmapData: heatmapData.map((d: DailyStat) => ({
                date: d.date,
                count: d.subtopicsCompleted,
            })),
        });
    } catch (error) {
        console.error("Dashboard metrics error:", error);
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
