import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, unauthorized } from "@/lib/auth";
import Topic from "@/models/Topic";
import Subtopic from "@/models/Subtopic";
import { updateTopicSchema, parseBody } from "@/lib/validations";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return unauthorized();

        const { id } = await params;
        const body = await req.json();
        const parsed = parseBody(updateTopicSchema, body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
        if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
        if (parsed.data.difficulty !== undefined) updateData.difficulty = parsed.data.difficulty;
        if (parsed.data.order !== undefined) updateData.order = parsed.data.order;
        if (parsed.data.estimatedHours !== undefined) updateData.estimatedHours = parsed.data.estimatedHours;

        const topic = await Topic.findOneAndUpdate(
            { _id: id, userId },
            { $set: updateData },
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
        const userId = await getAuthUserId(req);
        if (!userId) return unauthorized();

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
