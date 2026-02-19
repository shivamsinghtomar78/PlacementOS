"use client";

import { auth } from "@/lib/firebase";

export async function apiClient(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    let user = auth.currentUser;
    if (!user && typeof (auth as unknown as { authStateReady?: () => Promise<void> }).authStateReady === "function") {
        await (auth as unknown as { authStateReady: () => Promise<void> }).authStateReady();
        user = auth.currentUser;
    }
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (user) {
        const token = await user.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
        headers["x-firebase-uid"] = user.uid;
    }

    return fetch(url, {
        cache: options.cache ?? "no-store",
        ...options,
        headers,
    });
}
