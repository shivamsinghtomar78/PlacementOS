import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, unauthorized } from "@/lib/auth";
import Notification from "@/models/Notification";
import { notificationPatchSchema, parseBody } from "@/lib/validations";

export async function GET(req: NextRequest) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return unauthorized();

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20);

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error("GET notifications error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return unauthorized();

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
                { _id: parsed.data.notificationId, userId },
                { read: true }
            );
        } else if (parsed.data.action === "markAllAsRead") {
            await Notification.updateMany(
                { userId, read: false },
                { read: true }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PATCH notifications error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
