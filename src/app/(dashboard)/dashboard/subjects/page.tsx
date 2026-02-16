"use client";

import { useState, useRef, useCallback, useEffect, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    ChevronDown,
    ChevronRight,
    MoreHorizontal,
    Edit2,
    Trash2,
    BookOpen,
    StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

const SUBJECT_ICONS = ["📚", "💻", "🧠", "🌐", "📊", "🔧", "📐", "🎯", "⚡", "🔬", "📝", "🏗️"];
const SUBJECT_COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308",
    "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#a855f7", "#6b7280",
];

const COMPANIES = [
    "FAANG", "Amazon", "Google", "Meta", "Apple", "Netflix",
    "Microsoft", "Product-based", "Service-based", "Startup",
];

const REVISION_LABELS = [
    { field: "learned", label: "Learned", days: 0 },
    { field: "revised1", label: "Rev 1", days: 1 },
    { field: "revised2", label: "Rev 2", days: 3 },
    { field: "revised3", label: "Rev 3", days: 7 },
    { field: "finalRevised", label: "Final", days: 30 },
];

// Status toggle component
function StatusToggle({
    status,
    onToggle,
}: {
    status: number;
    onToggle: () => void;
}) {
    const states = [
        { icon: "⭕", label: "Not Started", color: "text-gray-400" },
        { icon: "🟡", label: "In Progress", color: "text-yellow-400" },
        { icon: "✅", label: "Mastered", color: "text-green-400" },
    ];

    const current = states[status] || states[0];

    return (
        <button
            onClick={onToggle}
            className="group relative flex items-center gap-1.5"
            title={current.label}
        >
            <motion.span
                key={status}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-lg"
            >
                {current.icon}
            </motion.span>
        </button>
    );
}

// Add Subject Dialog
function AddSubjectDialog({ onClose }: { onClose?: () => void }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState("📚");
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
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
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

// Add Topic Dialog
function AddTopicDialog({
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

// Add Subtopic Dialog
function AddSubtopicDialog({
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

// Subtopic Row with status toggle, revision checkboxes, and notes
function SubtopicRow({ subtopic, topicId }: { subtopic: Record<string, unknown>; topicId: string }) {
    const queryClient = useQueryClient();
    const [showNotes, setShowNotes] = useState(false);
    const [notesValue, setNotesValue] = useState("");
    const [notesSaving, setNotesSaving] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const sub = subtopic as {
        _id: string;
        name: string;
        status: number;
        notes?: string;
        revision: Record<string, boolean>;
        companyTags: string[];
        resumeAligned: boolean;
        timeSpent: number;
    };

    // Initialize notes value when subtopic data loads
    useEffect(() => {
        setNotesValue(sub.notes || "");
    }, [sub.notes]);

    const statusMutation = useMutation({
        mutationFn: async () => {
            const res = await apiClient(`/api/subtopics/${sub._id}`, {
                method: "PATCH",
                body: JSON.stringify({ action: "cycleStatus" }),
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subtopics", topicId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const revisionMutation = useMutation({
        mutationFn: async (field: string) => {
            const res = await apiClient(`/api/subtopics/${sub._id}`, {
                method: "PATCH",
                body: JSON.stringify({ action: "toggleRevision", field }),
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subtopics", topicId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const res = await apiClient(`/api/subtopics/${sub._id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subtopics", topicId] });
        },
    });

    // Auto-save notes with debounce
    const saveNotes = useCallback(
        (value: string) => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(async () => {
                setNotesSaving(true);
                try {
                    const res = await apiClient(`/api/subtopics/${sub._id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ notes: value }),
                    });
                    if (res.ok) {
                        queryClient.invalidateQueries({ queryKey: ["subtopics", topicId] });
                    }
                } finally {
                    setNotesSaving(false);
                }
            }, 800);
        },
        [sub._id, topicId, queryClient]
    );

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNotesValue(value);
        saveNotes(value);
    };

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/30 rounded-lg transition-colors group"
            >
                <StatusToggle
                    status={sub.status}
                    onToggle={() => statusMutation.mutate()}
                />

                <span className="flex-1 text-sm text-slate-300 min-w-0 truncate">{sub.name}</span>

                {/* Notes toggle button */}
                <button
                    onClick={() => setShowNotes(!showNotes)}
                    className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-all",
                        showNotes
                            ? "text-indigo-400 bg-indigo-500/10"
                            : sub.notes
                                ? "text-slate-400 hover:text-indigo-400"
                                : "text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100"
                    )}
                    title="Notes"
                >
                    <StickyNote className="w-3.5 h-3.5" />
                    {sub.notes && !showNotes && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    )}
                </button>

                {/* Revision checkboxes */}
                <div className="hidden md:flex items-center gap-2">
                    {REVISION_LABELS.map((rev) => (
                        <div key={rev.field} className="flex flex-col items-center gap-0.5">
                            <Checkbox
                                checked={!!sub.revision[rev.field]}
                                onCheckedChange={() => revisionMutation.mutate(rev.field)}
                                className="border-slate-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                            />
                            <span className="text-[9px] text-slate-600">{rev.label}</span>
                        </div>
                    ))}
                </div>

                {/* Company tags */}
                {sub.companyTags?.length > 0 && (
                    <div className="hidden lg:flex gap-1">
                        {sub.companyTags.slice(0, 2).map((tag) => (
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

                {/* Time badge */}
                {sub.timeSpent > 0 && (
                    <span className="text-[10px] text-slate-600 hidden sm:block">
                        {Math.round(sub.timeSpent / 60)}h
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

            {/* Expandable notes section */}
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
                                    onChange={handleNotesChange}
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

// Topic section with expandable subtopics
const TopicSection = memo(({
    topic,
    subjectId,
}: {
    topic: { _id: string; name: string; difficulty: string };
    subjectId: string;
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

    const subtopics = subtopicsData?.subtopics || [];
    const completed = subtopics.filter((s: { status: number }) => s.status === 2).length;
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
                    {expanded ? (
                        <ChevronDown className="w-4 h-4" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    )}
                </button>

                <span className="text-sm font-medium text-slate-200 flex-1">{topic.name}</span>

                <Badge
                    variant="outline"
                    className={cn("text-[10px] px-1.5 py-0 border-0", difficultyColors[topic.difficulty])}
                >
                    {topic.difficulty}
                </Badge>

                {expanded && total > 0 && (
                    <span className="text-xs text-slate-500">
                        {completed}/{total}
                    </span>
                )}

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
                        {subtopics.map((subtopic: Record<string, unknown>) => (
                            <SubtopicRow
                                key={subtopic._id as string}
                                subtopic={subtopic}
                                topicId={topic._id}
                            />
                        ))}
                        {subtopics.length === 0 && (
                            <p className="text-xs text-slate-600 py-2 pl-8">
                                No subtopics yet. Click + to add one.
                            </p>
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

// Subject Card with expandable topics
function SubjectCard({
    subject,
}: {
    subject: {
        _id: string;
        name: string;
        icon: string;
        color: string;
        description: string;
    };
}) {
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
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
        },
    });

    const topics = topicsData?.topics || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            layout
        >
            <Card className="bg-slate-900/50 border-slate-800/50 overflow-hidden hover:border-slate-700/50 transition-all duration-200">
                <CardContent className="p-0">
                    {/* Subject Header */}
                    <div
                        className="flex items-center gap-3 p-4 cursor-pointer group"
                        onClick={() => setExpanded(!expanded)}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                            style={{ backgroundColor: `${subject.color}20` }}
                        >
                            {subject.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate">{subject.name}</h3>
                            {subject.description && (
                                <p className="text-xs text-slate-500 truncate">{subject.description}</p>
                            )}
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

                            {expanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                            )}
                        </div>
                    </div>

                    {/* Topics List */}
                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-slate-800/50 px-4 pb-4 overflow-hidden"
                            >
                                {topics.map((topic: { _id: string; name: string; difficulty: string }) => (
                                    <TopicSection
                                        key={topic._id}
                                        topic={topic}
                                        subjectId={subject._id}
                                    />
                                ))}
                                {topics.length === 0 && (
                                    <p className="text-sm text-slate-500 py-4 text-center">
                                        No topics yet. Click + to add your first topic.
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            <AddTopicDialog
                subjectId={subject._id}
                open={addTopicOpen}
                onOpenChange={setAddTopicOpen}
            />
        </motion.div>
    );
}

// Main Subjects Page
export default function SubjectsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["subjects"],
        queryFn: async () => {
            const res = await apiClient("/api/subjects");
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
    });

    const subjects = data?.subjects || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-400" />
                        Subjects
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage your subjects, topics, and subtopics
                    </p>
                </div>
                <AddSubjectDialog />
            </div>

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
                    <AddSubjectDialog />
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
                    {subjects.map(
                        (subject: {
                            _id: string;
                            name: string;
                            icon: string;
                            color: string;
                            description: string;
                        }) => (
                            <SubjectCard key={subject._id} subject={subject} />
                        )
                    )}
                </motion.div>
            )}
        </div>
    );
}
