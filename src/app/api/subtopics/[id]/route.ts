import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import Subtopic from "@/models/Subtopic";
import DailyProgress from "@/models/DailyProgress";
import User from "@/models/User";
import Notification from "@/models/Notification";
import Subject from "@/models/Subject";
import { sendNotificationEmail } from "@/lib/mail";
import { pusherServer } from "@/lib/pusher-server";
import { subtopicPatchSchema, updateSubtopicSchema, parseBody } from "@/lib/validations";
import { getScopedFilter, getTrackContextFromUser } from "@/lib/track-context";

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
        const parsed = parseBody(updateSubtopicSchema, body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const subtopic = await Subtopic.findOneAndUpdate(
            { _id: id, ...scope },
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

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        const context = getTrackContextFromUser(authUser);
        const scope = getScopedFilter(authUser._id, context);

        const { id } = await params;
        const body = await req.json();
        const parsed = parseBody(subtopicPatchSchema, body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const subtopic = await Subtopic.findOne({ _id: id, ...scope });
        if (!subtopic) return NextResponse.json({ error: "Subtopic not found" }, { status: 404 });

        if (parsed.data.action === "cycleStatus") {
            const oldStatus = subtopic.status;
            const newStatus = ((oldStatus + 1) % 3) as 0 | 1 | 2;
            subtopic.status = newStatus;

            if (newStatus === 2) {
                subtopic.revision.learned = true;
                subtopic.revision.learnedDate = new Date();
                subtopic.revision.lastRevisedDate = new Date();
            } else {
                subtopic.revision.learned = false;
                subtopic.revision.learnedDate = undefined;
            }

            if (newStatus === 2 && oldStatus !== 2) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                await DailyProgress.findOneAndUpdate(
                    { ...scope, date: today },
                    { $inc: { subtopicsCompleted: 1 } },
                    { upsert: true }
                );

                const [subjectDoc, userDoc] = await Promise.all([
                    Subject.findOne({ _id: subtopic.subjectId, ...scope }).select("name").lean(),
                    User.findById(authUser._id).select("email name").lean(),
                ]);

                await Notification.create({
                    ...scope,
                    title: "Subtopic Mastered!",
                    message: `Congratulations! You've mastered "${subtopic.name}" in ${subjectDoc?.name || "your subjects"}.`,
                    type: "success",
                });

                if (userDoc?.email) {
                    void sendNotificationEmail(
                        userDoc.email,
                        "Subtopic Mastered!",
                        `Hi ${userDoc.name},\n\nCongratulations! You've just mastered the subtopic: "${subtopic.name}".\n\nKeep up the great work on your preparation!\n\nBest,\nPlacementOS Team`
                    ).catch((err) => {
                        console.error("Failed to send mastery email:", err);
                    });
                }
            }
        }

        if (parsed.data.action === "toggleRevision" && parsed.data.field) {
            const revisionField = parsed.data.field as keyof typeof subtopic.revision;
            const currentValue = subtopic.revision[revisionField];

            if (typeof currentValue === "boolean") {
                const newValue = !currentValue;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rev = subtopic.revision as any;
                rev[revisionField] = newValue;

                if (newValue) {
                    const subjectDoc = await Subject.findOne({ _id: subtopic.subjectId, ...scope }).select("name").lean();
                    const milestoneNames: Record<string, string> = {
                        learned: "Mastered",
                        revised1: "First Revision",
                        revised2: "Second Revision",
                        revised3: "Third Revision",
                        finalRevised: "Final Revision"
                    };

                    await Notification.create({
                        ...scope,
                        title: `${milestoneNames[revisionField] || "Milestone"} Reached!`,
                        message: `Great job! You've completed the ${milestoneNames[revisionField] || "revision"} for "${subtopic.name}" in ${subjectDoc?.name || "your subjects"}.`,
                        type: "success",
                    });
                }

                if (revisionField === "learned") {
                    subtopic.status = newValue ? 2 : 0;
                }

                const dateField = `${revisionField}Date`;
                if (newValue) {
                    rev[dateField] = new Date();
                    subtopic.revision.lastRevisedDate = new Date();
                } else {
                    rev[dateField] = undefined;
                }
            }
        }

        if (parsed.data.notes !== undefined) {
            subtopic.notes = parsed.data.notes;
        }

        if (parsed.data.companyTags !== undefined) {
            subtopic.companyTags = parsed.data.companyTags;
        }

        if (parsed.data.resumeAligned !== undefined) {
            subtopic.resumeAligned = parsed.data.resumeAligned;
        }

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
            await pusherServer?.trigger(`user-${authUser._id}`, "dashboard-update", {
                track: context.track,
                department: context.department,
            });
        }

        await subtopic.save();
        return NextResponse.json({ subtopic });
    } catch (error) {
        console.error("PATCH subtopic error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        const scope = getScopedFilter(authUser._id, getTrackContextFromUser(authUser));

        const { id } = await params;
        const subtopic = await Subtopic.findOneAndDelete({ _id: id, ...scope });

        if (!subtopic) return NextResponse.json({ error: "Subtopic not found" }, { status: 404 });
        return NextResponse.json({ message: "Subtopic deleted successfully" });
    } catch (error) {
        console.error("DELETE subtopic error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
