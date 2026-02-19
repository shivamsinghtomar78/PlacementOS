"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { getClientScopeKey } from "@/lib/track-context";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, dbUser } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const seededScopeRef = useRef<string | null>(null);
    const scopeKey = getClientScopeKey(dbUser?.preferences);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!dbUser?._id) return;
        if (seededScopeRef.current === scopeKey) return;

        void (async () => {
            try {
                const res = await apiClient("/api/seed", { method: "POST" });
                if (!res.ok) return;
                seededScopeRef.current = scopeKey;
                await queryClient.invalidateQueries();
                await queryClient.refetchQueries({ type: "active" });
            } catch {
                // No-op: non-blocking background seed sync.
            }
        })();
    }, [dbUser?._id, scopeKey, queryClient]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Loading your command center...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-950 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen lg:ml-72">
                <Header />
                <motion.main
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 p-4 lg:p-6 mx-auto w-full max-w-[1400px]"
                >
                    {children}
                </motion.main>
            </div>
        </div>
    );
}
