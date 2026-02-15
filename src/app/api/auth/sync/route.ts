import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { firebaseUid, email, name, image } = body;

        if (!firebaseUid || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        let user = await User.findOne({ firebaseUid });

        if (!user) {
            user = await User.create({
                firebaseUid,
                email,
                name: name || email.split("@")[0],
                image,
                targetCompanies: [],
                preferences: {
                    theme: "dark",
                    dailyTarget: 5,
                    focusMode: false,
                    notifications: true,
                    placementMode: false,
                },
            });
        } else {
            // Update existing user with latest info
            if (name) user.name = name;
            if (image) user.image = image;
            user.email = email;
            await user.save();
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Auth sync error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
