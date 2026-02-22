"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { getClientScopeKey } from "@/lib/track-context";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading, dbUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const seededScopeRef = useRef<string | null>(null);
  const scopeKey = getClientScopeKey(dbUser?.preferences);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, router, user]);

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
        // no-op
      }
    })();
  }, [dbUser?._id, queryClient, scopeKey]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="lg:ml-72 min-h-screen flex flex-col">
        <Header />
        <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  );
}

