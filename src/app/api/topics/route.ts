import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthUserId, unauthorized } from "@/lib/auth";
import Topic from "@/models/Topic";
import Subtopic from "@/models/Subtopic";
import { createTopicSchema, parseBody } from "@/lib/validations";

// GET /api/topics?subjectId=xxx — List topics for a subject with aggregated counts
export async function GET(req: NextRequest) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return unauthorized();

        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get("subjectId");

        if (!subjectId) {
            return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
        }

        const subjectObjectId = new mongoose.Types.ObjectId(subjectId);

        const [topics, subtopicCounts] = await Promise.all([
            Topic.find({ userId, subjectId: subjectObjectId })
                .sort({ order: 1 })
                .lean(),
            Subtopic.aggregate([
                { $match: { userId, subjectId: subjectObjectId } },
                {
                    $group: {
                        _id: "$topicId",
                        subtopicCount: { $sum: 1 },
                        completedSubtopics: {
                            $sum: { $cond: [{ $eq: ["$status", 2] }, 1, 0] },
                        },
                    },
                },
            ]),
        ]);

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

        const hydrated = topics.map((topic) => {
            const id = topic._id.toString();
            const stats = subtopicCountMap.get(id);
            return {
                ...topic,
                subtopicCount: stats?.subtopicCount ?? 0,
                completedSubtopics: stats?.completedSubtopics ?? 0,
            };
        });

        return NextResponse.json({ topics: hydrated });
    } catch (error) {
        console.error("GET topics error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/topics — Create topic
export async function POST(req: NextRequest) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return unauthorized();

        const body = await req.json();
        const parsed = parseBody(createTopicSchema, body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const count = await Topic.countDocuments({ userId, subjectId: parsed.data.subjectId });

        const topic = await Topic.create({
            subjectId: parsed.data.subjectId,
            userId,
            name: parsed.data.name,
            description: parsed.data.description || "",
            order: count,
            difficulty: parsed.data.difficulty || "Beginner",
            estimatedHours: parsed.data.estimatedHours,
        });

        return NextResponse.json({ topic }, { status: 201 });
    } catch (error) {
        console.error("POST topics error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
