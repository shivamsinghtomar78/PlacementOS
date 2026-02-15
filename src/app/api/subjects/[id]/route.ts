import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
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

// PUT /api/subjects/[id] — Update subject
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();

        const subject = await Subject.findOneAndUpdate(
            { _id: id, userId },
            {
                $set: {
                    ...(body.name && { name: body.name }),
                    ...(body.description !== undefined && { description: body.description }),
                    ...(body.icon && { icon: body.icon }),
                    ...(body.color && { color: body.color }),
                    ...(body.order !== undefined && { order: body.order }),
                    ...(body.targetCompletionDate !== undefined && {
                        targetCompletionDate: body.targetCompletionDate,
                    }),
                    ...(body.estimatedHours !== undefined && { estimatedHours: body.estimatedHours }),
                },
            },
            { new: true }
        );

        if (!subject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        return NextResponse.json({ subject });
    } catch (error) {
        console.error("PUT subject error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/subjects/[id] — Delete subject and all children
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        // Delete all subtopics under this subject
        await Subtopic.deleteMany({ subjectId: id, userId });
        // Delete all topics under this subject
        await Topic.deleteMany({ subjectId: id, userId });
        // Delete the subject
        const subject = await Subject.findOneAndDelete({ _id: id, userId });

        if (!subject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Subject deleted successfully" });
    } catch (error) {
        console.error("DELETE subject error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
