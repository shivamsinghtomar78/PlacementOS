"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { getClientScopeKey } from "@/lib/track-context";
import { Skeleton } from "@/components/ui/skeleton";
import { AddSubjectDialog } from "@/components/subjects/dialogs";
import { SubjectCard } from "@/components/subjects/subject-card";
import type { SubjectItem } from "@/components/subjects/constants";
import { PageHeader } from "@/components/common/page-header";

export default function SubjectsPage() {
  const { dbUser } = useAuth();
  const scopeKey = getClientScopeKey(dbUser?.preferences);

  const { data, isLoading } = useQuery({
    queryKey: ["subjects", scopeKey],
    queryFn: async () => {
      const res = await apiClient("/api/subjects");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!dbUser?._id,
  });

  const subjects = (data?.subjects || []) as SubjectItem[];

    return (
        <div className="space-y-6">
            <PageHeader
                icon={<BookOpen className="w-6 h-6 text-indigo-400" />}
                title="Subjects"
                subtitle="Manage your subjects, topics, and subtopics"
                right={<AddSubjectDialog scopeKey={scopeKey} />}
            />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-slate-800/50" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-400 mb-2">No subjects yet</h3>
          <p className="text-slate-600 text-sm mb-6">
            Create your first subject to start tracking your preparation
          </p>
          <AddSubjectDialog scopeKey={scopeKey} />
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
