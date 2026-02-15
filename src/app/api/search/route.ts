import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Topic from "@/models/Topic";
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

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";

        if (!query) return NextResponse.json({ results: [] });

        const [subjects, topics] = await Promise.all([
            Subject.find({
                userId,
                name: { $regex: query, $options: "i" },
            }).limit(5),
            Topic.find({
                userId,
                name: { $regex: query, $options: "i" },
            }).limit(10),
        ]);

        const results = [
            ...subjects.map(s => ({
                id: s._id,
                name: s.name,
                type: "subject",
                icon: s.icon,
                color: s.color,
                link: `/dashboard/subjects` // Could be more specific if there were deep links
            })),
            ...topics.map(t => ({
                id: t._id,
                name: t.name,
                type: "topic",
                link: `/dashboard/subjects` // Navigates to subjects page where it can be expanded
            }))
        ];

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
