import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Topic from "@/models/Topic";
import Subtopic from "@/models/Subtopic";
import User from "@/models/User";

async function getUserId(req: NextRequest) {
    const uid = req.headers.get("x-firebase-uid");
    if (!uid) return null;
    await dbConnect();
    const user = await User.findOne({ firebaseUid: uid });
    return user?._id;
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();

        const topic = await Topic.findOneAndUpdate(
            { _id: id, userId },
            {
                $set: {
                    ...(body.name && { name: body.name }),
                    ...(body.description !== undefined && { description: body.description }),
                    ...(body.difficulty && { difficulty: body.difficulty }),
                    ...(body.order !== undefined && { order: body.order }),
                    ...(body.estimatedHours !== undefined && { estimatedHours: body.estimatedHours }),
                },
            },
            { new: true }
        );

        if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
        return NextResponse.json({ topic });
    } catch (error) {
        console.error("PUT topic error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        await Subtopic.deleteMany({ topicId: id, userId });
        const topic = await Topic.findOneAndDelete({ _id: id, userId });

        if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
        return NextResponse.json({ message: "Topic deleted successfully" });
    } catch (error) {
        console.error("DELETE topic error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
