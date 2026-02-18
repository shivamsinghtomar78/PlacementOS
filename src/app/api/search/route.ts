import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, unauthorized } from "@/lib/auth";
import Subject from "@/models/Subject";
import Topic from "@/models/Topic";
import Subtopic from "@/models/Subtopic";

export async function GET(req: NextRequest) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return unauthorized();

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";

        if (!query) return NextResponse.json({ results: [] });

        const [subjects, topics, subtopics] = await Promise.all([
            Subject.find({
                userId,
                name: { $regex: query, $options: "i" },
            }).limit(5),
            Topic.find({
                userId,
                name: { $regex: query, $options: "i" },
            }).limit(10),
            Subtopic.find({
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
                link: `/dashboard/subjects`
            })),
            ...topics.map(t => ({
                id: t._id,
                name: t.name,
                type: "topic",
                link: `/dashboard/subjects`
            })),
            ...subtopics.map(st => ({
                id: st._id,
                name: st.name,
                type: "subtopic",
                link: `/dashboard/subjects`
            }))
        ];

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
