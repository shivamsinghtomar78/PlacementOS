import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Topic from "@/models/Topic";
import Subtopic from "@/models/Subtopic";
import DailyProgress from "@/models/DailyProgress";
import User from "@/models/User";

export const dynamic = 'force-dynamic';

async function getUserId(req: NextRequest) {
    const uid = req.headers.get("x-firebase-uid");
    if (!uid) return null;
    await dbConnect();
    const user = await User.findOne({ firebaseUid: uid });
    return user?._id;
}

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Aggregate metrics
        const [subjects, topics, subtopics, allSubtopics] = await Promise.all([
            Subject.find({ userId }),
            Topic.countDocuments({ userId }),
            Subtopic.countDocuments({ userId, status: 2 }),
            Subtopic.find({ userId }),
        ]);

        const totalSubtopics = allSubtopics.length;
        const completedSubtopics = allSubtopics.filter((s) => s.status === 2).length;
        const inProgressSubtopics = allSubtopics.filter((s) => s.status === 1).length;
        const overallProgress = totalSubtopics > 0
            ? Math.round((completedSubtopics / totalSubtopics) * 100)
            : 0;

        // Subject-wise progress
        const subjectProgress = await Promise.all(
            subjects.map(async (subject) => {
                const subs = allSubtopics.filter(
                    (s) => s.subjectId.toString() === subject._id.toString()
                );
                const total = subs.length;
                const completed = subs.filter((s) => s.status === 2).length;
                const inProgress = subs.filter((s) => s.status === 1).length;
                return {
                    _id: subject._id,
                    name: subject.name,
                    icon: subject.icon,
                    color: subject.color,
                    total,
                    completed,
                    inProgress,
                    notStarted: total - completed - inProgress,
                    progress: total > 0 ? Math.round((completed / total) * 100) : 0,
                };
            })
        );

        // Weakest subject
        const weakestSubject = subjectProgress
            .filter((s) => s.total > 0)
            .sort((a, b) => a.progress - b.progress)[0] || null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Heatmap data (last 365 days)
        const yearAgo = new Date(today);
        yearAgo.setDate(yearAgo.getDate() - 365);

        const heatmapData = await DailyProgress.find({
            userId,
            date: { $gte: yearAgo },
        }).sort({ date: -1 }); // Sort descending for easier streak calculation

        // dailyStats (last 30 days) for weekly chart
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dailyStats = heatmapData
            .filter(d => new Date(d.date) >= thirtyDaysAgo)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Streak calculation using heatmapData
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

        // If nothing today, start checking from yesterday. 
        // But if there's something today, today starts the streak.
        if (!streakDates.has(checkDate.getTime())) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (streakDates.has(checkDate.getTime())) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        // Revision due items
        const revisionDue = allSubtopics.filter((s) => {
            if (!s.revision.learnedDate) return false;
            const learnedDate = new Date(s.revision.learnedDate);
            const now = new Date();
            const daysSince = Math.floor(
                (now.getTime() - learnedDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (!s.revision.revised1 && daysSince >= 1) return true;
            if (!s.revision.revised2 && daysSince >= 3) return true;
            if (!s.revision.revised3 && daysSince >= 7) return true;
            if (!s.revision.finalRevised && daysSince >= 30) return true;
            return false;
        });

        return NextResponse.json({
            metrics: {
                overallProgress,
                totalSubjects: subjects.length,
                totalTopics: topics,
                totalSubtopics,
                completedSubtopics,
                inProgressSubtopics,
                streak,
                weakestSubject,
                revisionDueCount: revisionDue.length,
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
