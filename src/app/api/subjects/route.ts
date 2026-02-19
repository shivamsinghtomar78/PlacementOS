import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, unauthorized } from "@/lib/auth";
import Subject from "@/models/Subject";
import Topic from "@/models/Topic";
import Subtopic from "@/models/Subtopic";
import { createSubjectSchema, parseBody } from "@/lib/validations";

// GET /api/subjects — List all subjects for user with aggregated counts
export async function GET(req: NextRequest) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return unauthorized();

        const [subjects, topicCounts, subtopicCounts] = await Promise.all([
            Subject.find({ userId })
                .sort({ order: 1 })
                .lean(),
            Topic.aggregate([
                { $match: { userId } },
                { $group: { _id: "$subjectId", count: { $sum: 1 } } },
            ]),
            Subtopic.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: "$subjectId",
                        subtopicCount: { $sum: 1 },
                        completedSubtopics: {
                            $sum: { $cond: [{ $eq: ["$status", 2] }, 1, 0] },
                        },
                    },
                },
            ]),
        ]);

        const topicCountMap = new Map<string, number>(
            topicCounts.map((item) => [item._id.toString(), item.count])
        );
        const subtopicCountMap = new Map<
            string,
            { subtopicCount: number; completedSubtopics: number }
        >(
            subtopicCounts.map((item) => [
                item._id.toString(),
                {
                    subtopicCount: item.subtopicCount,
                    completedSubtopics: item.completedSubtopics,
                },
            ])
        );

        const hydrated = subjects.map((subject) => {
            const id = subject._id.toString();
            const subtopicStats = subtopicCountMap.get(id);

            return {
                ...subject,
                topicCount: topicCountMap.get(id) ?? 0,
                subtopicCount: subtopicStats?.subtopicCount ?? 0,
                completedSubtopics: subtopicStats?.completedSubtopics ?? 0,
            };
        });

        return NextResponse.json({ subjects: hydrated });
    } catch (error) {
        console.error("GET subjects error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/subjects — Create new subject
export async function POST(req: NextRequest) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return unauthorized();

        const body = await req.json();
        const parsed = parseBody(createSubjectSchema, body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const count = await Subject.countDocuments({ userId });

        const subject = await Subject.create({
            userId,
            name: parsed.data.name,
            description: parsed.data.description || "",
            icon: parsed.data.icon || "📚",
            color: parsed.data.color || "#6366f1",
            order: count,
            targetCompletionDate: parsed.data.targetCompletionDate,
            estimatedHours: parsed.data.estimatedHours,
        });

        return NextResponse.json({ subject }, { status: 201 });
    } catch (error) {
        console.error("POST subjects error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
