"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, RefreshCw } from "lucide-react";
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
import { SectionReveal } from "@/components/common/section-reveal";
import NumberTicker from "@/components/ui/number-ticker";
import { Card, CardContent } from "@/components/ui/card";

export default function SubjectsPage() {
  const { dbUser, user } = useAuth();
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
                typewriterWords={[
                    { text: "Subject" },
                    { text: "Workspace", className: "text-indigo-300" },
                ]}
                helpText="Expand any subject to manage nested topics and subtopics with inline status and revision controls."
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

      <SectionReveal className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="bg-slate-900/50 border-slate-800/60">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Subjects in scope</p>
            <p className="text-2xl font-semibold text-white mt-1">
              <NumberTicker value={subjects.length} className="text-white" />
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800/60">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Active mode</p>
            <p className="text-lg font-semibold text-white mt-1">
              {activeTrack === "sarkari" ? `Sarkari - ${deptLabel}` : "Placement"}
            </p>
          </CardContent>
        </Card>
      </SectionReveal>

      {isLoading ? (
        <SectionReveal className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-slate-800/50" />
          ))}
        </SectionReveal>
      ) : isError ? (
        <SectionReveal>
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
        </SectionReveal>
      ) : subjects.length === 0 ? (
        <SectionReveal>
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
              ? `Preparing syllabus for Sarkari (${deptLabel}) in this context.`
              : "Preparing syllabus for Placement mode in this context."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => refetch()} variant="outline" className="border-slate-700 text-slate-300">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <AddSubjectDialog scopeKey={scopeKey} />
          </div>
        </motion.div>
        </SectionReveal>
      ) : (
        <SectionReveal>
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
        </SectionReveal>
      )}
    </div>
  );
}
