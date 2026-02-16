import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, unauthorized } from "@/lib/auth";
import Subject from "@/models/Subject";
import { createSubjectSchema, parseBody } from "@/lib/validations";

// GET /api/subjects — List all subjects for user with aggregated counts
export async function GET(req: NextRequest) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return unauthorized();

        // Use aggregation to get counts in a single query
        const subjects = await Subject.aggregate([
            { $match: { userId } },
            { $sort: { order: 1 } },
            {
                $lookup: {
                    from: "topics",
                    localField: "_id",
                    foreignField: "subjectId",
                    as: "topics",
                },
            },
            {
                $lookup: {
                    from: "subtopics",
                    localField: "_id",
                    foreignField: "subjectId",
                    as: "subtopics",
                },
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    icon: 1,
                    color: 1,
                    order: 1,
                    targetCompletionDate: 1,
                    estimatedHours: 1,
                    createdAt: 1,
                    topicCount: { $size: "$topics" },
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

        return NextResponse.json({ subjects });
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
