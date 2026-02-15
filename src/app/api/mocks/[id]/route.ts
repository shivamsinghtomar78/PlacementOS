import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MockInterview from "@/models/MockInterview";
import User from "@/models/User";

async function getUserId(req: NextRequest) {
    const uid = req.headers.get("x-firebase-uid");
    if (!uid) return null;
    await dbConnect();
    const user = await User.findOne({ firebaseUid: uid });
    return user?._id;
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();

        const mock = await MockInterview.findOneAndUpdate(
            { _id: id, userId },
            { $set: body },
            { new: true }
        );

        if (!mock) return NextResponse.json({ error: "Mock not found" }, { status: 404 });
        return NextResponse.json({ mock });
    } catch (error) {
        console.error("PUT mock error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const mock = await MockInterview.findOneAndDelete({ _id: id, userId });

        if (!mock) return NextResponse.json({ error: "Mock not found" }, { status: 404 });
        return NextResponse.json({ message: "Mock deleted" });
    } catch (error) {
        console.error("DELETE mock error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
