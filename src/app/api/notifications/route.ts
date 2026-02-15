import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import User from "@/models/User";

async function getUserId(req: NextRequest) {
    const uid = req.headers.get("x-firebase-uid");
    if (!uid) return null;
    await dbConnect();
    const user = await User.findOne({ firebaseUid: uid });
    return user?._id;
}

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { notificationId, action } = body;

        if (action === "markAsRead") {
            await Notification.updateOne(
                { _id: notificationId, userId },
                { read: true }
            );
        } else if (action === "markAllAsRead") {
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
