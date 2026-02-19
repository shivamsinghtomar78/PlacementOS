"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Database, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { getClientScopeKey } from "@/lib/track-context";
import { Skeleton } from "@/components/ui/skeleton";
import { AddSubjectDialog } from "@/components/subjects/dialogs";
import { SubjectCard } from "@/components/subjects/subject-card";
import type { SubjectItem } from "@/components/subjects/constants";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SubjectsPage() {
  const { dbUser, user, refreshDbUser } = useAuth();
  const queryClient = useQueryClient();
  const scopeKey = getClientScopeKey(dbUser?.preferences);
  const activeTrack = dbUser?.preferences?.activeTrack || "placement";
  const sarkariDepartment = dbUser?.preferences?.sarkariDepartment || "mechanical";

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["subjects", scopeKey],
    queryFn: async () => {
      const res = await apiClient("/api/subjects");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!user,
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient("/api/seed", { method: "POST" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Failed to load syllabus");
      return payload;
    },
    onSuccess: async () => {
      await refreshDbUser();
      await queryClient.invalidateQueries({ queryKey: ["subjects"] });
      await refetch();
    },
  });

  const subjects = (data?.subjects || []) as SubjectItem[];
  const trackLabel = activeTrack === "sarkari" ? "Sarkari" : "Placement";
  const deptLabel = sarkariDepartment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

    return (
        <div className="space-y-6">
            <PageHeader
                icon={<BookOpen className="w-6 h-6 text-indigo-400" />}
                title="Subjects"
                subtitle="Manage your subjects, topics, and subtopics"
                right={
                  <div className="flex items-center gap-2">
                    <Badge className={activeTrack === "sarkari" ? "bg-emerald-500/20 text-emerald-300" : "bg-indigo-500/20 text-indigo-300"}>
                      {trackLabel}
                    </Badge>
                    {activeTrack === "sarkari" && (
                      <Badge className="bg-slate-800 text-slate-300">{deptLabel}</Badge>
                    )}
                    <AddSubjectDialog scopeKey={scopeKey} />
                  </div>
                }
            />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-slate-800/50" />
          ))}
        </div>
      ) : isError ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6"
        >
          <p className="text-red-300 font-medium">Failed to load subjects</p>
          <p className="text-red-200/80 text-sm mt-1">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="mt-4 border-red-500/30 text-red-300 hover:bg-red-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </motion.div>
      ) : subjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-400 mb-2">No subjects found</h3>
          <p className="text-slate-600 text-sm mb-6">
            {activeTrack === "sarkari"
              ? `No subjects available for Sarkari (${deptLabel}) in this account context yet.`
              : "No subjects available for Placement mode in this account context yet."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              variant="outline"
              className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
            >
              <Database className="w-4 h-4 mr-2" />
              {seedMutation.isPending ? "Loading..." : "Load Syllabus For This Mode"}
            </Button>
            <AddSubjectDialog scopeKey={scopeKey} />
          </div>
          {seedMutation.isError && (
            <p className="text-red-300 text-sm mt-3">
              {seedMutation.error instanceof Error ? seedMutation.error.message : "Failed to load syllabus"}
            </p>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
          className="space-y-3"
        >
          {subjects.map((subject) => (
            <SubjectCard key={subject._id} subject={subject} scopeKey={scopeKey} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
