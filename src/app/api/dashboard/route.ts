import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getAuthUserId, unauthorized } from "@/lib/auth";
import Subject from "@/models/Subject";
import Topic from "@/models/Topic";
import Subtopic from "@/models/Subtopic";
import DailyProgress from "@/models/DailyProgress";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return unauthorized();

        await dbConnect();

        // ─── Aggregation: Overall + Per-Subject Progress ─────────────────────
        const [subjectProgressAgg, subjects, topicCount] = await Promise.all([
            Subtopic.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: { subjectId: "$subjectId", status: "$status" },
                        count: { $sum: 1 },
                    },
                },
            ]),
            Subject.find({ userId }).sort({ order: 1 }).lean(),
            Topic.countDocuments({ userId }),
        ]);

        // Build per-subject progress from aggregation
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

        // Weakest subject
        const weakestSubject = subjectProgress
            .filter((s) => s.total > 0)
            .sort((a, b) => a.progress - b.progress)[0] || null;

        // ─── Aggregation: Revision Due Count ─────────────────────────────────
        const now = new Date();
        const [revisionDueResult] = await Subtopic.aggregate([
            {
                $match: {
                    userId,
                    "revision.learnedDate": { $exists: true, $ne: null },
                },
            },
            {
                $addFields: {
                    daysSinceLearned: {
                        $dateDiff: {
                            startDate: "$revision.learnedDate",
                            endDate: now,
                            unit: "day",
                        },
                    },
                },
            },
            {
                $match: {
                    $or: [
                        { "revision.revised1": false, daysSinceLearned: { $gte: 1 } },
                        { "revision.revised2": false, daysSinceLearned: { $gte: 3 } },
                        { "revision.revised3": false, daysSinceLearned: { $gte: 7 } },
                        { "revision.finalRevised": false, daysSinceLearned: { $gte: 30 } },
                    ],
                },
            },
            { $count: "count" },
        ]);
        const revisionDueCount = revisionDueResult?.count || 0;

        // ─── Heatmap & Streak (DailyProgress is already indexed) ─────────────
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yearAgo = new Date(today);
        yearAgo.setDate(yearAgo.getDate() - 365);

        const heatmapData = await DailyProgress.find({
            userId,
            date: { $gte: yearAgo },
        }).sort({ date: -1 }).lean();

        // dailyStats (last 30 days) for weekly chart
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dailyStats = heatmapData
            .filter(d => new Date(d.date) >= thirtyDaysAgo)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Streak calculation
        let streak = 0;
        const streakDates = new Set(
            heatmapData
                .filter(d => d.subtopicsCompleted > 0)
                .map(d => {
                    const date = new Date(d.date);
                    date.setHours(0, 0, 0, 0);
                    return date.getTime();
                })
        );

        let checkDate = new Date(today);
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
            weeklyStats: dailyStats.map((d: any) => ({
                date: d.date,
                completed: d.subtopicsCompleted,
                timeSpent: d.timeSpent,
            })),
            heatmapData: heatmapData.map((d: any) => ({
                date: d.date,
                count: d.subtopicsCompleted,
            })),
        });
    } catch (error) {
        console.error("Dashboard metrics error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
