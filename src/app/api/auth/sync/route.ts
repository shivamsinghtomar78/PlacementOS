import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { authSyncSchema, parseBody } from "@/lib/validations";
import { normalizeDepartment, normalizeTrack } from "@/lib/track-context";

function parsePlacementDeadline(value: string | undefined): Date | null | undefined {
    if (value === undefined) return undefined;
    if (!value.trim()) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error("Invalid placementDeadline");
    }
    return parsed;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = parseBody(authSyncSchema, body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const { firebaseUid, email, name, image } = parsed.data;

        await dbConnect();

        let user = await User.findOne({ firebaseUid });
        const parsedDeadline = parsePlacementDeadline(parsed.data.placementDeadline);

        if (!user) {
            const activeTrack = normalizeTrack(parsed.data.preferences?.activeTrack);
            user = await User.create({
                firebaseUid,
                email,
                name: name || email.split("@")[0],
                image,
                placementDeadline: parsedDeadline ?? undefined,
                targetCompanies: parsed.data.targetCompanies || [],
                preferences: {
                    theme: parsed.data.preferences?.theme || "dark",
                    dailyTarget: parsed.data.preferences?.dailyTarget || 5,
                    focusMode: parsed.data.preferences?.focusMode || false,
                    notifications: parsed.data.preferences?.notifications ?? true,
                    placementMode: activeTrack === "placement",
                    activeTrack,
                    sarkariDepartment: normalizeDepartment(parsed.data.preferences?.sarkariDepartment),
                },
            });
        } else {
            // Update existing user with latest info
            if (name) user.name = name;
            if (image) user.image = image;
            user.email = email;

            // Update preferences and metadata if provided
            if (parsedDeadline !== undefined) {
                user.placementDeadline = parsedDeadline ?? undefined;
            }
            if (parsed.data.targetCompanies !== undefined) user.targetCompanies = parsed.data.targetCompanies;

            if (parsed.data.preferences) {
                const activeTrack = normalizeTrack(parsed.data.preferences.activeTrack ?? user.preferences.activeTrack);
                user.preferences = {
                    ...user.preferences,
                    ...parsed.data.preferences,
                    placementMode: activeTrack === "placement",
                    activeTrack,
                    sarkariDepartment: normalizeDepartment(parsed.data.preferences.sarkariDepartment ?? user.preferences.sarkariDepartment),
                };
            }

            await user.save();
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Auth sync error:", error);
        if (error instanceof Error && error.message === "Invalid placementDeadline") {
            return NextResponse.json({ error: "Invalid placement deadline date format" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
