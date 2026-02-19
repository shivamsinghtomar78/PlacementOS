"use client";

import { memo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddSubtopicDialog } from "./dialogs";
import { SubtopicRow } from "./subtopic-row";
import { SubtopicItem, TopicItem } from "./constants";

export const TopicSection = memo(({
  topic,
  subjectId,
  scopeKey,
}: {
  topic: TopicItem;
  subjectId: string;
  scopeKey: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [addSubtopicOpen, setAddSubtopicOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: subtopicsData } = useQuery({
    queryKey: ["subtopics", topic._id],
    queryFn: async () => {
      const res = await apiClient(`/api/subtopics?topicId=${topic._id}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: expanded,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient(`/api/topics/${topic._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", subjectId] });
    },
  });

  const subtopics = (subtopicsData?.subtopics || []) as SubtopicItem[];
  const completed = subtopics.filter((s) => s.status === 2).length;
  const total = subtopics.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const difficultyColors: Record<string, string> = {
    Beginner: "text-green-400 bg-green-500/10",
    Intermediate: "text-yellow-400 bg-yellow-500/10",
    Advanced: "text-red-400 bg-red-500/10",
  };

  return (
    <div className="border-l-2 border-slate-800 ml-4 pl-3">
      <div className="flex items-center gap-2 py-2 group">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <span className="text-sm font-medium text-slate-200 flex-1">{topic.name}</span>

        <Badge
          variant="outline"
          className={cn("text-[10px] px-1.5 py-0 border-0", difficultyColors[topic.difficulty])}
        >
          {topic.difficulty}
        </Badge>

        {expanded && total > 0 && <span className="text-xs text-slate-500">{completed}/{total}</span>}

        {expanded && (
          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setAddSubtopicOpen(true)}
          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-indigo-400 h-6 w-6"
        >
          <Plus className="w-3 h-3" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 text-slate-500 h-6 w-6"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-800 border-slate-700">
            <DropdownMenuItem
              className="text-red-400 focus:text-red-400"
              onClick={() => deleteMutation.mutate()}
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {subtopics.map((subtopic) => (
              <SubtopicRow
                key={subtopic._id}
                subtopic={subtopic}
                topicId={topic._id}
                scopeKey={scopeKey}
              />
            ))}
            {subtopics.length === 0 && (
              <p className="text-xs text-slate-600 py-2 pl-8">No subtopics yet. Click + to add one.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AddSubtopicDialog
        topicId={topic._id}
        subjectId={subjectId}
        open={addSubtopicOpen}
        onOpenChange={setAddSubtopicOpen}
      />
    </div>
  );
});

TopicSection.displayName = "TopicSection";
