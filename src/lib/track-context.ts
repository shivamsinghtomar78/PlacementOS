import type { IUser } from "@/models/User";

export type TrackMode = "placement" | "sarkari";
export type SarkariDepartment = "mechanical" | "computer-science" | "ece" | "ec";

export const DEFAULT_TRACK: TrackMode = "placement";
export const DEFAULT_SARKARI_DEPARTMENT: SarkariDepartment = "mechanical";

export const SARKARI_DEPARTMENTS: Array<{ value: SarkariDepartment; label: string }> = [
    { value: "mechanical", label: "Mechanical" },
    { value: "computer-science", label: "Computer Science" },
    { value: "ece", label: "ECE" },
    { value: "ec", label: "EC" },
];

export function normalizeTrack(value: unknown): TrackMode {
    return value === "sarkari" ? "sarkari" : "placement";
}

export function normalizeDepartment(value: unknown): SarkariDepartment {
    switch (value) {
        case "computer-science":
        case "ece":
        case "ec":
        case "mechanical":
            return value;
        default:
            return DEFAULT_SARKARI_DEPARTMENT;
    }
}

export function getTrackContextFromUser(user: Pick<IUser, "preferences">): {
    track: TrackMode;
    department: SarkariDepartment | "general";
} {
    const track = normalizeTrack(user.preferences?.activeTrack);
    if (track === "sarkari") {
        return {
            track,
            department: normalizeDepartment(user.preferences?.sarkariDepartment),
        };
    }
    return {
        track,
        department: "general",
    };
}

export function getScopedFilter(
    userId: IUser["_id"],
    context: ReturnType<typeof getTrackContextFromUser>
) {
    return {
        userId,
        track: context.track,
        department: context.department,
    };
}

export function getClientScopeKey(preferences?: {
    activeTrack?: unknown;
    sarkariDepartment?: unknown;
}) {
    const track = normalizeTrack(preferences?.activeTrack);
    const department = track === "sarkari"
        ? normalizeDepartment(preferences?.sarkariDepartment)
        : "general";
    return `${track}:${department}`;
}
