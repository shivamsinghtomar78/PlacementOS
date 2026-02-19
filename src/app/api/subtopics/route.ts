import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import Subtopic from "@/models/Subtopic";
import Subject from "@/models/Subject";
import Topic from "@/models/Topic";
import { createSubtopicSchema, parseBody } from "@/lib/validations";
import { getScopedFilter, getTrackContextFromUser } from "@/lib/track-context";

// GET /api/subtopics?topicId=xxx — List subtopics for a topic
export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        const scope = getScopedFilter(authUser._id, getTrackContextFromUser(authUser));

        const { searchParams } = new URL(req.url);
        const topicId = searchParams.get("topicId");

        if (!topicId) {
            return NextResponse.json({ error: "topicId is required" }, { status: 400 });
        }

        const subtopics = await Subtopic.find({ ...scope, topicId }).sort({ order: 1 }).lean();
        return NextResponse.json({ subtopics });
    } catch (error) {
        console.error("GET subtopics error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/subtopics — Create subtopic
export async function POST(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        const scope = getScopedFilter(authUser._id, getTrackContextFromUser(authUser));

        const body = await req.json();
        const parsed = parseBody(createSubtopicSchema, body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const [subject, topic] = await Promise.all([
            Subject.findOne({ _id: parsed.data.subjectId, ...scope }).select("_id").lean(),
            Topic.findOne({ _id: parsed.data.topicId, ...scope }).select("_id").lean(),
        ]);
        if (!subject || !topic) {
            return NextResponse.json({ error: "Subject or topic not found in current mode" }, { status: 404 });
        }

        const count = await Subtopic.countDocuments({ ...scope, topicId: parsed.data.topicId });

        const subtopic = await Subtopic.create({
            topicId: parsed.data.topicId,
            subjectId: parsed.data.subjectId,
            ...scope,
            name: parsed.data.name,
            description: parsed.data.description || "",
            order: count,
            status: 0,
            revision: {
                learned: false,
                revised1: false,
                revised2: false,
                revised3: false,
                finalRevised: false,
            },
            resources: [],
            companyTags: parsed.data.companyTags || [],
            resumeAligned: false,
            timeSpent: 0,
            sessions: [],
        });

        return NextResponse.json({ subtopic }, { status: 201 });
    } catch (error) {
        console.error("POST subtopics error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
