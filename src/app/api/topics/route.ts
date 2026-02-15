import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Topic from "@/models/Topic";
import User from "@/models/User";

async function getUserId(req: NextRequest) {
    const uid = req.headers.get("x-firebase-uid");
    if (!uid) return null;
    await dbConnect();
    const user = await User.findOne({ firebaseUid: uid });
    return user?._id;
}

// GET /api/topics?subjectId=xxx — List topics for a subject
export async function GET(req: NextRequest) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get("subjectId");

        if (!subjectId) {
            return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
        }

        const topics = await Topic.find({ userId, subjectId }).sort({ order: 1 });
        return NextResponse.json({ topics });
    } catch (error) {
        console.error("GET topics error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/topics — Create topic
export async function POST(req: NextRequest) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        if (!body.subjectId || !body.name) {
            return NextResponse.json({ error: "subjectId and name are required" }, { status: 400 });
        }

        const count = await Topic.countDocuments({ userId, subjectId: body.subjectId });

        const topic = await Topic.create({
            subjectId: body.subjectId,
            userId,
            name: body.name,
            description: body.description || "",
            order: count,
            difficulty: body.difficulty || "Beginner",
            estimatedHours: body.estimatedHours,
        });

        return NextResponse.json({ topic }, { status: 201 });
    } catch (error) {
        console.error("POST topics error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
