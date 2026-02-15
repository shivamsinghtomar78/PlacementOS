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

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const mocks = await MockInterview.find({ userId }).sort({ date: -1 });
        return NextResponse.json({ mocks });
    } catch (error) {
        console.error("GET mocks error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const count = await MockInterview.countDocuments({ userId });

        const mock = await MockInterview.create({
            userId,
            mockNumber: count + 1,
            date: body.date || new Date(),
            duration: body.duration || 60,
            rating: body.rating || 5,
            company: body.company || "General",
            interviewer: body.interviewer,
            performance: body.performance || { technical: 5, communication: 5, problemSolving: 5 },
            weakAreas: body.weakAreas || [],
            notes: body.notes || "",
            recordingLink: body.recordingLink,
            linkedProblems: body.linkedProblems || [],
        });

        return NextResponse.json({ mock }, { status: 201 });
    } catch (error) {
        console.error("POST mocks error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
