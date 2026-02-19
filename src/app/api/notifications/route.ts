import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import Notification from "@/models/Notification";
import { notificationPatchSchema, parseBody } from "@/lib/validations";
import { getScopedFilter, getTrackContextFromUser } from "@/lib/track-context";

export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        const scope = getScopedFilter(authUser._id, getTrackContextFromUser(authUser));

        const notifications = await Notification.find(scope)
            .select("title message type link read createdAt")
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error("GET notifications error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        const scope = getScopedFilter(authUser._id, getTrackContextFromUser(authUser));

        const body = await req.json();
        const parsed = parseBody(notificationPatchSchema, body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        if (parsed.data.action === "markAsRead") {
            if (!parsed.data.notificationId) {
                return NextResponse.json({ error: "notificationId is required for markAsRead" }, { status: 400 });
            }
            await Notification.updateOne(
                { _id: parsed.data.notificationId, ...scope },
                { read: true }
            );
        } else if (parsed.data.action === "markAllAsRead") {
            await Notification.updateMany(
                { ...scope, read: false },
                { read: true }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PATCH notifications error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
