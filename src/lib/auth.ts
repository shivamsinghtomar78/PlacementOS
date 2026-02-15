import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function getAuthUser(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.split("Bearer ")[1];
    if (!token) return null;

    try {
        // We'll decode the Firebase token to get the UID
        // For simplicity, we use the sync endpoint to maintain the user in DB
        // API routes will receive the Firebase UID from the client
        const firebaseUid = req.headers.get("x-firebase-uid");
        if (!firebaseUid) return null;

        await dbConnect();
        const user = await User.findOne({ firebaseUid });
        return user;
    } catch {
        return null;
    }
}

export function unauthorized() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
