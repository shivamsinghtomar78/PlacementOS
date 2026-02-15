import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subtopic from "@/models/Subtopic";
import DailyProgress from "@/models/DailyProgress";
import User from "@/models/User";

async function getUserId(req: NextRequest) {
    const uid = req.headers.get("x-firebase-uid");
    if (!uid) return null;
    await dbConnect();
    const user = await User.findOne({ firebaseUid: uid });
    return user?._id;
}

// GET /api/subtopics?topicId=xxx — List subtopics for a topic
export async function GET(req: NextRequest) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const topicId = searchParams.get("topicId");

        if (!topicId) {
            return NextResponse.json({ error: "topicId is required" }, { status: 400 });
        }

        const subtopics = await Subtopic.find({ userId, topicId }).sort({ order: 1 });
        return NextResponse.json({ subtopics });
    } catch (error) {
        console.error("GET subtopics error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/subtopics — Create subtopic
export async function POST(req: NextRequest) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        if (!body.topicId || !body.subjectId || !body.name) {
            return NextResponse.json(
                { error: "topicId, subjectId, and name are required" },
                { status: 400 }
            );
        }

        const count = await Subtopic.countDocuments({ userId, topicId: body.topicId });

        const subtopic = await Subtopic.create({
            topicId: body.topicId,
            subjectId: body.subjectId,
            userId,
            name: body.name,
            description: body.description || "",
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
            companyTags: body.companyTags || [],
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
