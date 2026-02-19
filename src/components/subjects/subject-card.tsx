"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddTopicDialog } from "./dialogs";
import { SubjectItem, TopicItem } from "./constants";
import { TopicSection } from "./topic-section";

export function SubjectCard({ subject, scopeKey }: { subject: SubjectItem; scopeKey: string }) {
  const [expanded, setExpanded] = useState(false);
  const [addTopicOpen, setAddTopicOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: topicsData } = useQuery({
    queryKey: ["topics", subject._id],
    queryFn: async () => {
      const res = await apiClient(`/api/topics?subjectId=${subject._id}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: expanded,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient(`/api/subjects/${subject._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", scopeKey] });
    },
  });

  const topics = (topicsData?.topics || []) as TopicItem[];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} layout>
      <Card className="bg-slate-900/50 border-slate-800/50 overflow-hidden hover:border-slate-700/50 transition-all duration-200">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 p-4 cursor-pointer group" onClick={() => setExpanded(!expanded)}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{ backgroundColor: `${subject.color}20` }}
            >
              {subject.icon}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{subject.name}</h3>
              {subject.description && <p className="text-xs text-slate-500 truncate">{subject.description}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setAddTopicOpen(true);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-indigo-400 h-7 w-7"
              >
                <Plus className="w-4 h-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 h-7 w-7"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-700">
                  <DropdownMenuItem
                    className="text-red-400 focus:text-red-400"
                    onClick={() => deleteMutation.mutate()}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete Subject
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-slate-800/50 px-4 pb-4 overflow-hidden"
              >
                {topics.map((topic) => (
                  <TopicSection key={topic._id} topic={topic} subjectId={subject._id} scopeKey={scopeKey} />
                ))}
                {topics.length === 0 && (
                  <p className="text-sm text-slate-500 py-4 text-center">No topics yet. Click + to add your first topic.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <AddTopicDialog subjectId={subject._id} open={addTopicOpen} onOpenChange={setAddTopicOpen} />
    </motion.div>
  );
}
