import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subtopic from "@/models/Subtopic";
import DailyProgress from "@/models/DailyProgress";
import User from "@/models/User";
import Notification from "@/models/Notification";
import Subject from "@/models/Subject";
import { sendNotificationEmail } from "@/lib/mail";
import { pusherServer } from "@/lib/pusher-server";

async function getUserId(req: NextRequest) {
    const uid = req.headers.get("x-firebase-uid");
    if (!uid) return null;
    await dbConnect();
    const user = await User.findOne({ firebaseUid: uid });
    return user?._id;
}

// PUT /api/subtopics/[id] — Update subtopic
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();

        const subtopic = await Subtopic.findOneAndUpdate(
            { _id: id, userId },
            { $set: body },
            { new: true }
        );

        if (!subtopic) return NextResponse.json({ error: "Subtopic not found" }, { status: 404 });
        return NextResponse.json({ subtopic });
    } catch (error) {
        console.error("PUT subtopic error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/subtopics/[id] — Toggle status or revision
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();

        const subtopic = await Subtopic.findOne({ _id: id, userId });
        if (!subtopic) return NextResponse.json({ error: "Subtopic not found" }, { status: 404 });

        // Handle status cycling
        if (body.action === "cycleStatus") {
            const oldStatus = subtopic.status;
            subtopic.status = ((oldStatus + 1) % 3) as 0 | 1 | 2;

            // Track daily progress when completing
            if (subtopic.status === 2 && oldStatus !== 2) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                await DailyProgress.findOneAndUpdate(
                    { userId, date: today },
                    { $inc: { subtopicsCompleted: 1 } },
                    { upsert: true }
                );

                // Create Notification
                const subjectDoc = await Subject.findById(subtopic.subjectId);
                const notification = await Notification.create({
                    userId,
                    title: "Subtopic Mastered! 🎉",
                    message: `Congratulations! You've mastered "${subtopic.name}" in ${subjectDoc?.name || "your subjects"}.`,
                    type: "success",
                });

                // Send Email Notification
                const userDoc = await User.findById(userId);
                if (userDoc?.email) {
                    await sendNotificationEmail(
                        userDoc.email,
                        "Subtopic Mastered! 🎉",
                        `Hi ${userDoc.name},\n\nCongratulations! You've just mastered the subtopic: "${subtopic.name}".\n\nKeep up the great work on your placement preparation!\n\nBest,\nPlacementOS Team`
                    );
                }
            }
        }

        // Handle revision toggle
        if (body.action === "toggleRevision" && body.field) {
            const revisionField = body.field as keyof typeof subtopic.revision;
            const currentValue = subtopic.revision[revisionField];

            if (typeof currentValue === "boolean") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rev = subtopic.revision as any;
                rev[revisionField] = !currentValue;

                // Set date for this revision
                const dateField = `${revisionField}Date`;
                if (!currentValue) {
                    rev[dateField] = new Date();
                    subtopic.revision.lastRevisedDate = new Date();
                } else {
                    rev[dateField] = undefined;
                }
            }
        }

        // Handle notes update
        if (body.notes !== undefined) {
            subtopic.notes = body.notes;
        }

        // Handle company tags
        if (body.companyTags !== undefined) {
            subtopic.companyTags = body.companyTags;
        }

        // Handle resume alignment
        if (body.resumeAligned !== undefined) {
            subtopic.resumeAligned = body.resumeAligned;
        }

        // Handle time session
        if (body.action === "addSession" && body.session) {
            subtopic.sessions.push(body.session);
            subtopic.timeSpent += body.session.duration;
        }

        if (body.action === "cycleStatus" || body.action === "toggleRevision") {
            await pusherServer?.trigger(`user-${userId}`, "dashboard-update", {});
        }

        await subtopic.save();
        return NextResponse.json({ subtopic });
    } catch (error) {
        console.error("PATCH subtopic error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/subtopics/[id]
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const subtopic = await Subtopic.findOneAndDelete({ _id: id, userId });

        if (!subtopic) return NextResponse.json({ error: "Subtopic not found" }, { status: 404 });
        return NextResponse.json({ message: "Subtopic deleted successfully" });
    } catch (error) {
        console.error("DELETE subtopic error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
