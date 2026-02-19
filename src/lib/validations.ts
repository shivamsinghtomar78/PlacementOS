import { z } from "zod/v4";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authSyncSchema = z.object({
    firebaseUid: z.string().min(1, "firebaseUid is required"),
    email: z.email("Invalid email address"),
    name: z.string().optional(),
    image: z.url().optional().or(z.literal("")),
    placementDeadline: z.string().optional(),
    targetCompanies: z.array(z.string()).optional(),
    preferences: z.object({
        theme: z.enum(["light", "dark"]).optional(),
        dailyTarget: z.number().int().min(1).max(50).optional(),
        focusMode: z.boolean().optional(),
        notifications: z.boolean().optional(),
        placementMode: z.boolean().optional(),
        activeTrack: z.enum(["placement", "sarkari"]).optional(),
        sarkariDepartment: z.enum(["mechanical", "computer-science", "ece", "ec"]).optional(),
    }).optional(),
});

// ─── Subjects ────────────────────────────────────────────────────────────────

export const createSubjectSchema = z.object({
    name: z.string().min(1, "Subject name is required").max(100),
    description: z.string().max(500).optional(),
    icon: z.string().max(10).optional(),
    color: z.string().max(20).optional(),
    targetCompletionDate: z.string().optional(),
    estimatedHours: z.number().min(0).optional(),
});

export const updateSubjectSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    icon: z.string().max(10).optional(),
    color: z.string().max(20).optional(),
    order: z.number().int().min(0).optional(),
    targetCompletionDate: z.string().nullable().optional(),
    estimatedHours: z.number().min(0).nullable().optional(),
});

// ─── Topics ──────────────────────────────────────────────────────────────────

export const createTopicSchema = z.object({
    subjectId: z.string().min(1, "subjectId is required"),
    name: z.string().min(1, "Topic name is required").max(200),
    description: z.string().max(500).optional(),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    estimatedHours: z.number().min(0).optional(),
});

export const updateTopicSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(500).optional(),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    order: z.number().int().min(0).optional(),
    estimatedHours: z.number().min(0).nullable().optional(),
});

// ─── Subtopics ───────────────────────────────────────────────────────────────

export const createSubtopicSchema = z.object({
    topicId: z.string().min(1, "topicId is required"),
    subjectId: z.string().min(1, "subjectId is required"),
    name: z.string().min(1, "Subtopic name is required").max(300),
    description: z.string().max(1000).optional(),
    companyTags: z.array(z.string()).optional(),
});

export const updateSubtopicSchema = z.object({
    name: z.string().min(1).max(300).optional(),
    description: z.string().max(1000).optional(),
    status: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
    notes: z.string().max(5000).optional(),
    companyTags: z.array(z.string()).optional(),
    resumeAligned: z.boolean().optional(),
    revision: z.object({
        learned: z.boolean().optional(),
        revised1: z.boolean().optional(),
        revised2: z.boolean().optional(),
        revised3: z.boolean().optional(),
        finalRevised: z.boolean().optional(),
    }).optional(),
});

const sessionSchema = z.object({
    sessionDate: z.string().optional(),
    duration: z.number().min(0, "Duration must be positive"),
    notes: z.string().max(2000).optional(),
});

export const subtopicPatchSchema = z.object({
    action: z.enum(["cycleStatus", "toggleRevision", "addSession"]).optional(),
    field: z.enum(["learned", "revised1", "revised2", "revised3", "finalRevised"]).optional(),
    notes: z.string().max(5000).optional(),
    companyTags: z.array(z.string()).optional(),
    resumeAligned: z.boolean().optional(),
    session: sessionSchema.optional(),
});

// ─── Notifications ───────────────────────────────────────────────────────────

export const notificationPatchSchema = z.object({
    notificationId: z.string().optional(),
    action: z.enum(["markAsRead", "markAllAsRead"]),
});

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Parse request body with a Zod schema, returning parsed data or a 400 error response.
 */
export function parseBody<T>(schema: z.ZodType<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
    const result = schema.safeParse(data);
    if (!result.success) {
        const errors = result.error.issues.map(
            (i) => `${i.path.join(".")}: ${i.message}`
        ).join("; ");
        return { success: false, error: errors };
    }
    return { success: true, data: result.data };
}
