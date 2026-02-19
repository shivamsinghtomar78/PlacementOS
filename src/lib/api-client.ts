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
    const buildHeaders = async (forceRefreshToken = false) => {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(options.headers as Record<string, string>),
        };

        if (user) {
            const token = await user.getIdToken(forceRefreshToken);
            headers.Authorization = `Bearer ${token}`;
            headers["x-firebase-uid"] = user.uid;
        }

        return headers;
    };

    const doFetch = async (forceRefreshToken = false) => {
        const headers = await buildHeaders(forceRefreshToken);
        return fetch(url, {
            cache: options.cache ?? "no-store",
            ...options,
            headers,
        });
    };

    let res = await doFetch(false);

    // Refresh-time auth races can produce transient 401s; retry once with a fresh token.
    if (res.status === 401 && user) {
        res = await doFetch(true);
    }

    return res;
}
