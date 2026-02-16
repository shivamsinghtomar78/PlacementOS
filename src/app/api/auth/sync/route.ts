import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { authSyncSchema, parseBody } from "@/lib/validations";

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

        if (!user) {
            user = await User.create({
                firebaseUid,
                email,
                name: name || email.split("@")[0],
                image,
                placementDeadline: parsed.data.placementDeadline ? new Date(parsed.data.placementDeadline) : undefined,
                targetCompanies: parsed.data.targetCompanies || [],
                preferences: {
                    theme: parsed.data.preferences?.theme || "dark",
                    dailyTarget: parsed.data.preferences?.dailyTarget || 5,
                    focusMode: parsed.data.preferences?.focusMode || false,
                    notifications: parsed.data.preferences?.notifications ?? true,
                    placementMode: parsed.data.preferences?.placementMode || false,
                },
            });
        } else {
            // Update existing user with latest info
            if (name) user.name = name;
            if (image) user.image = image;
            user.email = email;

            // Update preferences and metadata if provided
            if (parsed.data.placementDeadline !== undefined) user.placementDeadline = new Date(parsed.data.placementDeadline);
            if (parsed.data.targetCompanies !== undefined) user.targetCompanies = parsed.data.targetCompanies;

            if (parsed.data.preferences) {
                user.preferences = {
                    ...user.preferences,
                    ...parsed.data.preferences
                };
            }

            await user.save();
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Auth sync error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
