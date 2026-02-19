import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, unauthorized } from "@/lib/auth";
import Subject from "@/models/Subject";
import Topic from "@/models/Topic";
import Subtopic from "@/models/Subtopic";

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
    try {
        const userId = await getAuthUserId(req);
        if (!userId) return unauthorized();

        const { searchParams } = new URL(req.url);
        const query = (searchParams.get("q") || "").trim();

        if (query.length < 3) return NextResponse.json({ results: [] });

        const safeQuery = escapeRegex(query).slice(0, 64);
        const prefixPattern = new RegExp(`^${safeQuery}`, "i");

        const [subjects, topics, subtopics] = await Promise.all([
            Subject.find({
                userId,
                name: { $regex: prefixPattern },
            })
                .select("name icon color")
                .limit(5)
                .lean(),
            Topic.find({
                userId,
                name: { $regex: prefixPattern },
            })
                .select("name")
                .limit(10)
                .lean(),
            Subtopic.find({
                userId,
                name: { $regex: prefixPattern },
            })
                .select("name")
                .limit(10)
                .lean(),
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
