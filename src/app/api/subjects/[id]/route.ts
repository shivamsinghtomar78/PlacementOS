import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import Subject from "@/models/Subject";
import Topic from "@/models/Topic";
import Subtopic from "@/models/Subtopic";
import { updateSubjectSchema, parseBody } from "@/lib/validations";
import { getScopedFilter, getTrackContextFromUser } from "@/lib/track-context";

// PUT /api/subjects/[id] — Update subject
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        const scope = getScopedFilter(authUser._id, getTrackContextFromUser(authUser));

        const { id } = await params;
        const body = await req.json();
        const parsed = parseBody(updateSubjectSchema, body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
        if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
        if (parsed.data.icon !== undefined) updateData.icon = parsed.data.icon;
        if (parsed.data.color !== undefined) updateData.color = parsed.data.color;
        if (parsed.data.order !== undefined) updateData.order = parsed.data.order;
        if (parsed.data.targetCompletionDate !== undefined) updateData.targetCompletionDate = parsed.data.targetCompletionDate;
        if (parsed.data.estimatedHours !== undefined) updateData.estimatedHours = parsed.data.estimatedHours;

        const subject = await Subject.findOneAndUpdate(
            { _id: id, ...scope },
            { $set: updateData },
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
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        const scope = getScopedFilter(authUser._id, getTrackContextFromUser(authUser));

        const { id } = await params;

        // Delete all subtopics under this subject
        await Subtopic.deleteMany({ subjectId: id, ...scope });
        // Delete all topics under this subject
        await Topic.deleteMany({ subjectId: id, ...scope });
        // Delete the subject
        const subject = await Subject.findOneAndDelete({ _id: id, ...scope });

        if (!subject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Subject deleted successfully" });
    } catch (error) {
        console.error("DELETE subject error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
