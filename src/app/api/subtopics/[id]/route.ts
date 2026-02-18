import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, unauthorized } from "@/lib/auth";
import Subtopic from "@/models/Subtopic";
import DailyProgress from "@/models/DailyProgress";
import User from "@/models/User";
import Notification from "@/models/Notification";
import Subject from "@/models/Subject";
import { sendNotificationEmail } from "@/lib/mail";
import { pusherServer } from "@/lib/pusher-server";
import { subtopicPatchSchema, updateSubtopicSchema, parseBody } from "@/lib/validations";

// PUT /api/subtopics/[id] — Update subtopic
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return unauthorized();

        const { id } = await params;
        const body = await req.json();
        const parsed = parseBody(updateSubtopicSchema, body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const subtopic = await Subtopic.findOneAndUpdate(
            { _id: id, userId },
            { $set: parsed.data },
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
        const userId = await getAuthUserId(req);
        if (!userId) return unauthorized();

        const { id } = await params;
        const body = await req.json();
        const parsed = parseBody(subtopicPatchSchema, body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const subtopic = await Subtopic.findOne({ _id: id, userId });
        if (!subtopic) return NextResponse.json({ error: "Subtopic not found" }, { status: 404 });

        // Handle status cycling
        if (parsed.data.action === "cycleStatus") {
            const oldStatus = subtopic.status;
            const newStatus = ((oldStatus + 1) % 3) as 0 | 1 | 2;
            subtopic.status = newStatus;

            // Sync with learned revision
            if (newStatus === 2) {
                subtopic.revision.learned = true;
                subtopic.revision.learnedDate = new Date();
                subtopic.revision.lastRevisedDate = new Date();
            } else {
                subtopic.revision.learned = false;
                subtopic.revision.learnedDate = undefined;
            }

            // Track daily progress when completing
            if (newStatus === 2 && oldStatus !== 2) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                await DailyProgress.findOneAndUpdate(
                    { userId, date: today },
                    { $inc: { subtopicsCompleted: 1 } },
                    { upsert: true }
                );

                // Create Notification
                const subjectDoc = await Subject.findById(subtopic.subjectId);
                await Notification.create({
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
        if (parsed.data.action === "toggleRevision" && parsed.data.field) {
            const revisionField = parsed.data.field as keyof typeof subtopic.revision;
            const currentValue = subtopic.revision[revisionField];

            if (typeof currentValue === "boolean") {
                const newValue = !currentValue;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rev = subtopic.revision as any;
                rev[revisionField] = newValue;

                // Milestone notification (no DailyProgress increment — only cycleStatus counts completions)
                if (newValue) {

                    // Milestone Notification
                    const subjectDoc = await Subject.findById(subtopic.subjectId);
                    const milestoneNames: Record<string, string> = {
                        learned: "Mastered",
                        revised1: "First Revision",
                        revised2: "Second Revision",
                        revised3: "Third Revision",
                        finalRevised: "Final Revision"
                    };

                    await Notification.create({
                        userId,
                        title: `${milestoneNames[revisionField] || "Milestone"} Reached! 🚀`,
                        message: `Great job! You've completed the ${milestoneNames[revisionField] || "revision"} for "${subtopic.name}" in ${subjectDoc?.name || "your subjects"}.`,
                        type: "success",
                    });
                }

                // Sync status if "learned" is toggled
                if (revisionField === "learned") {
                    subtopic.status = newValue ? 2 : 0;
                }

                // Set date for this revision
                const dateField = `${revisionField}Date`;
                if (newValue) {
                    rev[dateField] = new Date();
                    subtopic.revision.lastRevisedDate = new Date();
                } else {
                    rev[dateField] = undefined;
                }
            }
        }

        // Handle notes update
        if (parsed.data.notes !== undefined) {
            subtopic.notes = parsed.data.notes;
        }

        // Handle company tags
        if (parsed.data.companyTags !== undefined) {
            subtopic.companyTags = parsed.data.companyTags;
        }

        // Handle resume alignment
        if (parsed.data.resumeAligned !== undefined) {
            subtopic.resumeAligned = parsed.data.resumeAligned;
        }

        // Handle time session
        if (parsed.data.action === "addSession" && parsed.data.session) {
            const sessionData = {
                ...parsed.data.session,
                sessionDate: parsed.data.session.sessionDate
                    ? new Date(parsed.data.session.sessionDate)
                    : new Date(),
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            subtopic.sessions.push(sessionData as any);
            subtopic.timeSpent += parsed.data.session.duration;
        }

        if (parsed.data.action === "cycleStatus" || parsed.data.action === "toggleRevision") {
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
        const userId = await getAuthUserId(req);
        if (!userId) return unauthorized();

        const { id } = await params;
        const subtopic = await Subtopic.findOneAndDelete({ _id: id, userId });

        if (!subtopic) return NextResponse.json({ error: "Subtopic not found" }, { status: 404 });
        return NextResponse.json({ message: "Subtopic deleted successfully" });
    } catch (error) {
        console.error("DELETE subtopic error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
