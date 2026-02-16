import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import type { IUser } from "@/models/User";

/**
 * Verify the Firebase ID token from the Authorization header.
 * Falls back to x-firebase-uid header if Firebase Admin is not configured (dev mode).
 */
async function resolveFirebaseUid(req: NextRequest): Promise<string | null> {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : null;

    // Try server-side token verification first
    if (token) {
        const adminAuth = getFirebaseAdmin();
        if (adminAuth) {
            try {
                const decoded = await adminAuth.verifyIdToken(token);
                return decoded.uid;
            } catch (error) {
                console.error("Firebase token verification failed:", error);
                return null;
            }
        }
    }

    // Fallback: trust x-firebase-uid header (only when Firebase Admin is not configured)
    const fallbackUid = req.headers.get("x-firebase-uid");
    if (fallbackUid) {
        const adminAuth = getFirebaseAdmin();
        if (!adminAuth) {
            console.warn(
                "[AUTH] Firebase Admin not configured — using unverified x-firebase-uid header. " +
                "Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY for production security."
            );
            return fallbackUid;
        }
    }

    return null;
}

/**
 * Get the authenticated user's MongoDB _id.
 * Verifies the Firebase token and looks up the MongoDB user.
 */
export async function getAuthUserId(req: NextRequest): Promise<IUser["_id"] | null> {
    const firebaseUid = await resolveFirebaseUid(req);
    if (!firebaseUid) return null;

    await dbConnect();
    const user = await User.findOne({ firebaseUid });
    return user?._id ?? null;
}

/**
 * Get the full authenticated MongoDB user document.
 */
export async function getAuthUser(req: NextRequest): Promise<IUser | null> {
    const firebaseUid = await resolveFirebaseUid(req);
    if (!firebaseUid) return null;

    await dbConnect();
    const user = await User.findOne({ firebaseUid });
    return user;
}

/**
 * Return a 401 Unauthorized JSON response.
 */
export function unauthorized() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
