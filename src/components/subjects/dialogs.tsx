"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUBJECT_COLORS, SUBJECT_ICONS } from "./constants";

export function AddSubjectDialog({ scopeKey, onClose }: { scopeKey: string; onClose?: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("??");
  const [color, setColor] = useState("#6366f1");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { name: string; description: string; icon: string; color: string }) => {
      const res = await apiClient("/api/subjects", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", scopeKey] });
      setName("");
      setDescription("");
      setOpen(false);
      onClose?.();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-500 hover:bg-indigo-600 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Subject
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Subject</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-slate-300">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Data Structures & Algorithms"
              className="bg-slate-800 border-slate-700 text-white mt-1"
            />
          </div>
          <div>
            <Label className="text-slate-300">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              className="bg-slate-800 border-slate-700 text-white mt-1"
              rows={2}
            />
          </div>
          <div>
            <Label className="text-slate-300">Icon</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {SUBJECT_ICONS.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all",
                    icon === i
                      ? "bg-indigo-500/20 ring-2 ring-indigo-500"
                      : "bg-slate-800 hover:bg-slate-700"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-slate-300">Color</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-7 h-7 rounded-full transition-all",
                    color === c && "ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <Button
            onClick={() => mutation.mutate({ name, description, icon, color })}
            disabled={!name || mutation.isPending}
            className="w-full bg-indigo-500 hover:bg-indigo-600"
          >
            {mutation.isPending ? "Creating..." : "Create Subject"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AddTopicDialog({
  subjectId,
  open,
  onOpenChange,
}: {
  subjectId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { name: string; subjectId: string; difficulty: string }) => {
      const res = await apiClient("/api/topics", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", subjectId] });
      setName("");
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Add Topic</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-slate-300">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arrays"
              className="bg-slate-800 border-slate-700 text-white mt-1"
            />
          </div>
          <div>
            <Label className="text-slate-300">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => mutation.mutate({ name, subjectId, difficulty })}
            disabled={!name || mutation.isPending}
            className="w-full bg-indigo-500 hover:bg-indigo-600"
          >
            {mutation.isPending ? "Creating..." : "Add Topic"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AddSubtopicDialog({
  topicId,
  subjectId,
  open,
  onOpenChange,
}: {
  topicId: string;
  subjectId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { name: string; topicId: string; subjectId: string }) => {
      const res = await apiClient("/api/subtopics", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtopics", topicId] });
      setName("");
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Add Subtopic</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-slate-300">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Two Pointer Technique"
              className="bg-slate-800 border-slate-700 text-white mt-1"
            />
          </div>
          <Button
            onClick={() => mutation.mutate({ name, topicId, subjectId })}
            disabled={!name || mutation.isPending}
            className="w-full bg-indigo-500 hover:bg-indigo-600"
          >
            {mutation.isPending ? "Creating..." : "Add Subtopic"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
