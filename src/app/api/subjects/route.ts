import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import User from "@/models/User";

async function getUserId(req: NextRequest) {
    const uid = req.headers.get("x-firebase-uid");
    if (!uid) return null;
    await dbConnect();
    const user = await User.findOne({ firebaseUid: uid });
    return user?._id;
}

// GET /api/subjects — List all subjects for user
export async function GET(req: NextRequest) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const subjects = await Subject.find({ userId }).sort({ order: 1 });
        return NextResponse.json({ subjects });
    } catch (error) {
        console.error("GET subjects error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/subjects — Create new subject
export async function POST(req: NextRequest) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const count = await Subject.countDocuments({ userId });

        const subject = await Subject.create({
            userId,
            name: body.name,
            description: body.description || "",
            icon: body.icon || "📚",
            color: body.color || "#6366f1",
            order: count,
            targetCompletionDate: body.targetCompletionDate,
            estimatedHours: body.estimatedHours,
        });

        return NextResponse.json({ subject }, { status: 201 });
    } catch (error) {
        console.error("POST subjects error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
