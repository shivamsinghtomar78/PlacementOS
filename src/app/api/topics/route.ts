import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthUserId, unauthorized } from "@/lib/auth";
import Topic from "@/models/Topic";
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

        const topics = await Topic.aggregate([
            { $match: { userId, subjectId: new mongoose.Types.ObjectId(subjectId) } },
            { $sort: { order: 1 } },
            {
                $lookup: {
                    from: "subtopics",
                    localField: "_id",
                    foreignField: "topicId",
                    as: "subtopics",
                },
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    order: 1,
                    difficulty: 1,
                    estimatedHours: 1,
                    timeSpent: 1,
                    createdAt: 1,
                    subtopicCount: { $size: "$subtopics" },
                    completedSubtopics: {
                        $size: {
                            $filter: {
                                input: "$subtopics",
                                as: "s",
                                cond: { $eq: ["$$s.status", 2] },
                            },
                        },
                    },
                },
            },
        ]);

        return NextResponse.json({ topics });
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
