"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, StickyNote, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { REVISION_LABELS, SubtopicItem } from "./constants";
import { StatusToggle } from "./status-toggle";

export function SubtopicRow({
  subtopic,
  topicId,
  scopeKey,
}: {
  subtopic: SubtopicItem;
  topicId: string;
  scopeKey: string;
}) {
  const queryClient = useQueryClient();
  const [showNotes, setShowNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setNotesValue(subtopic.notes || "");
  }, [subtopic.notes]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const statusMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient(`/api/subtopics/${subtopic._id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "cycleStatus" }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtopics", topicId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", scopeKey] });
    },
  });

  const revisionMutation = useMutation({
    mutationFn: async (field: string) => {
      const res = await apiClient(`/api/subtopics/${subtopic._id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "toggleRevision", field }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtopics", topicId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", scopeKey] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient(`/api/subtopics/${subtopic._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtopics", topicId] });
    },
  });

  const saveNotes = useCallback(
    (value: string) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        setNotesSaving(true);
        try {
          const res = await apiClient(`/api/subtopics/${subtopic._id}`, {
            method: "PATCH",
            body: JSON.stringify({ notes: value }),
          });
          if (res.ok) {
            queryClient.setQueryData(
              ["subtopics", topicId],
              (prev: { subtopics?: SubtopicItem[] } | undefined) => {
                if (!prev?.subtopics) return prev;
                return {
                  ...prev,
                  subtopics: prev.subtopics.map((item) =>
                    item._id === subtopic._id ? { ...item, notes: value } : item
                  ),
                };
              }
            );
          }
        } finally {
          setNotesSaving(false);
        }
      }, 800);
    },
    [subtopic._id, topicId, queryClient]
  );

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/30 rounded-lg transition-colors group"
      >
        <StatusToggle status={subtopic.status} onToggle={() => statusMutation.mutate()} />

        <span className="flex-1 text-sm text-slate-300 min-w-0 truncate">{subtopic.name}</span>

        <button
          onClick={() => setShowNotes(!showNotes)}
          className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-all",
            showNotes
              ? "text-indigo-400 bg-indigo-500/10"
              : subtopic.notes
                ? "text-slate-400 hover:text-indigo-400"
                : "text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100"
          )}
          title="Notes"
        >
          <StickyNote className="w-3.5 h-3.5" />
          {subtopic.notes && !showNotes && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          )}
        </button>

        <div className="hidden md:flex items-center gap-2">
          {REVISION_LABELS.map((rev) => (
            <div key={rev.field} className="flex flex-col items-center gap-0.5">
              <Checkbox
                checked={!!subtopic.revision[rev.field]}
                onCheckedChange={() => revisionMutation.mutate(rev.field)}
                className="border-slate-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
              />
              <span className="text-[9px] text-slate-600">{rev.label}</span>
            </div>
          ))}
        </div>

        {subtopic.companyTags?.length > 0 && (
          <div className="hidden lg:flex gap-1">
            {subtopic.companyTags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] border-slate-700 text-slate-500 px-1.5 py-0"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {subtopic.timeSpent > 0 && (
          <span className="text-[10px] text-slate-600 hidden sm:block">
            {Math.round(subtopic.timeSpent / 60)}h
          </span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white h-7 w-7"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-800 border-slate-700">
            <DropdownMenuItem
              className="text-slate-300 focus:text-white focus:bg-slate-700"
              onClick={() => setShowNotes(!showNotes)}
            >
              <StickyNote className="w-3.5 h-3.5 mr-2" />
              {showNotes ? "Hide Notes" : "Edit Notes"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
              onClick={() => deleteMutation.mutate()}
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-10 mr-4 mb-3 mt-1">
              <div className="relative">
                <Textarea
                  value={notesValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNotesValue(value);
                    saveNotes(value);
                  }}
                  placeholder="Add your notes here... (unlimited)"
                  className="bg-slate-800/50 border-slate-700/50 text-slate-300 text-sm placeholder:text-slate-600 min-h-[80px] resize-y focus:border-indigo-500/50 focus:ring-indigo-500/20"
                  rows={3}
                />
                {notesSaving && (
                  <span className="absolute bottom-2 right-2 text-[10px] text-indigo-400 animate-pulse">
                    Saving...
                  </span>
                )}
                {!notesSaving && notesValue && (
                  <span className="absolute bottom-2 right-2 text-[10px] text-slate-600">
                    Auto-saved
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
