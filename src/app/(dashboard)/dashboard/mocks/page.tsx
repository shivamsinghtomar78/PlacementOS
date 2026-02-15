"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import {
    GraduationCap,
    Plus,
    Calendar,
    Clock,
    Star,
    Building2,
    TrendingUp,
    Trash2,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from "recharts";
import { format } from "date-fns";

const COMPANIES = [
    "Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix",
    "Goldman Sachs", "Morgan Stanley", "Flipkart", "Uber", "Other",
];

// Star rating component
function StarRating({
    value,
    max = 10,
    onChange,
}: {
    value: number;
    max?: number;
    onChange?: (v: number) => void;
}) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: max }, (_, i) => (
                <button
                    key={i}
                    onClick={() => onChange?.(i + 1)}
                    className="transition-colors"
                    type="button"
                >
                    <Star
                        className={`w-4 h-4 ${i < value
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-700"
                            }`}
                    />
                </button>
            ))}
            <span className="text-xs text-slate-400 ml-2">{value}/{max}</span>
        </div>
    );
}

// Add Mock Interview Dialog
function AddMockDialog() {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [duration, setDuration] = useState("60");
    const [company, setCompany] = useState("Other");
    const [interviewer, setInterviewer] = useState("");
    const [rating, setRating] = useState(5);
    const [technical, setTechnical] = useState(5);
    const [communication, setCommunication] = useState(5);
    const [problemSolving, setProblemSolving] = useState(5);
    const [notes, setNotes] = useState("");
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const res = await apiClient("/api/mocks", {
                method: "POST",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mocks"] });
            setOpen(false);
            resetForm();
        },
    });

    const resetForm = () => {
        setDate(format(new Date(), "yyyy-MM-dd"));
        setDuration("60");
        setCompany("Other");
        setInterviewer("");
        setRating(5);
        setTechnical(5);
        setCommunication(5);
        setProblemSolving(5);
        setNotes("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-500 hover:bg-indigo-600 text-white gap-2">
                    <Plus className="w-4 h-4" /> New Mock Interview
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Record Mock Interview</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-slate-300">Date</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-white mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-slate-300">Duration (min)</Label>
                            <Input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-white mt-1"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-slate-300">Company</Label>
                            <Select value={company} onValueChange={setCompany}>
                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    {COMPANIES.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-slate-300">Interviewer</Label>
                            <Input
                                value={interviewer}
                                onChange={(e) => setInterviewer(e.target.value)}
                                placeholder="Optional"
                                className="bg-slate-800 border-slate-700 text-white mt-1"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-slate-300">Overall Rating</Label>
                        <div className="mt-1">
                            <StarRating value={rating} onChange={setRating} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-slate-300">Performance Metrics</Label>
                        {[
                            { label: "Technical", value: technical, set: setTechnical },
                            { label: "Communication", value: communication, set: setCommunication },
                            { label: "Problem Solving", value: problemSolving, set: setProblemSolving },
                        ].map((metric) => (
                            <div key={metric.label} className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">{metric.label}</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min={1}
                                        max={10}
                                        value={metric.value}
                                        onChange={(e) => metric.set(Number(e.target.value))}
                                        className="w-24 accent-indigo-500"
                                    />
                                    <span className="text-sm text-white w-6 text-right">{metric.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <Label className="text-slate-300">Notes</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Key takeaways, improvements needed..."
                            className="bg-slate-800 border-slate-700 text-white mt-1"
                            rows={3}
                        />
                    </div>

                    <Button
                        onClick={() =>
                            mutation.mutate({
                                date,
                                duration: Number(duration),
                                company,
                                interviewer,
                                rating,
                                performance: { technical, communication, problemSolving },
                                notes,
                            })
                        }
                        disabled={mutation.isPending}
                        className="w-full bg-indigo-500 hover:bg-indigo-600"
                    >
                        {mutation.isPending ? "Saving..." : "Save Mock Interview"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Mock interview card
function MockCard({
    mock,
}: {
    mock: {
        _id: string;
        mockNumber: number;
        date: string;
        duration: number;
        rating: number;
        company: string;
        interviewer?: string;
        performance: { technical: number; communication: number; problemSolving: number };
        notes?: string;
    };
}) {
    const [expanded, setExpanded] = useState(false);
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const res = await apiClient(`/api/mocks/${mock._id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mocks"] });
        },
    });

    const avgPerf = Math.round(
        (mock.performance.technical +
            mock.performance.communication +
            mock.performance.problemSolving) / 3
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-slate-900/50 border-slate-800/50 hover:border-slate-700/50 transition-all">
                <CardContent className="p-4">
                    <div
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={() => setExpanded(!expanded)}
                    >
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
                            #{mock.mockNumber}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-white">{mock.company}</span>
                                {mock.interviewer && (
                                    <span className="text-xs text-slate-500">with {mock.interviewer}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(mock.date), "MMM d, yyyy")}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {mock.duration} min
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-medium text-white">{mock.rating}</span>
                                    <span className="text-xs text-slate-500">/10</span>
                                </div>
                                <span className="text-[10px] text-slate-500">Avg: {avgPerf}/10</span>
                            </div>

                            <ChevronDown
                                className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""
                                    }`}
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                                    {/* Performance bars */}
                                    <div className="space-y-2">
                                        {[
                                            { label: "Technical", value: mock.performance.technical, color: "bg-blue-500" },
                                            { label: "Communication", value: mock.performance.communication, color: "bg-green-500" },
                                            { label: "Problem Solving", value: mock.performance.problemSolving, color: "bg-violet-500" },
                                        ].map((p) => (
                                            <div key={p.label} className="flex items-center gap-3">
                                                <span className="text-xs text-slate-400 w-28">{p.label}</span>
                                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${p.value * 10}%` }}
                                                        transition={{ duration: 0.5 }}
                                                        className={`h-full rounded-full ${p.color}`}
                                                    />
                                                </div>
                                                <span className="text-xs text-white w-6 text-right">{p.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {mock.notes && (
                                        <div>
                                            <span className="text-xs text-slate-500">Notes</span>
                                            <p className="text-sm text-slate-300 mt-1">{mock.notes}</p>
                                        </div>
                                    )}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => deleteMutation.mutate()}
                                        className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function MocksPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["mocks"],
        queryFn: async () => {
            const res = await apiClient("/api/mocks");
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
    });

    const mocks = data?.mocks || [];

    // Trend data
    const trendData = [...mocks]
        .reverse()
        .map((m: { mockNumber: number; rating: number; performance: { technical: number; communication: number; problemSolving: number } }) => ({
            name: `#${m.mockNumber}`,
            rating: m.rating,
            technical: m.performance.technical,
            communication: m.performance.communication,
            problemSolving: m.performance.problemSolving,
        }));

    // Average performance for radar chart
    const avgPerf = mocks.length > 0
        ? {
            technical: Math.round(mocks.reduce((s: number, m: { performance: { technical: number } }) => s + m.performance.technical, 0) / mocks.length * 10) / 10,
            communication: Math.round(mocks.reduce((s: number, m: { performance: { communication: number } }) => s + m.performance.communication, 0) / mocks.length * 10) / 10,
            problemSolving: Math.round(mocks.reduce((s: number, m: { performance: { problemSolving: number } }) => s + m.performance.problemSolving, 0) / mocks.length * 10) / 10,
        }
        : null;

    const radarData = avgPerf
        ? [
            { metric: "Technical", value: avgPerf.technical },
            { metric: "Communication", value: avgPerf.communication },
            { metric: "Problem Solving", value: avgPerf.problemSolving },
        ]
        : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-indigo-400" />
                        Mock Interviews
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Track and analyze your mock interview performance
                    </p>
                </div>
                <AddMockDialog />
            </div>

            {/* Stats overview */}
            {mocks.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-slate-900/50 border-slate-800/50">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-white">{mocks.length}</div>
                            <div className="text-sm text-slate-400 mt-1">Total Mocks</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800/50">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
                                <Star className="w-6 h-6 fill-yellow-400" />
                                {(mocks.reduce((s: number, m: { rating: number }) => s + m.rating, 0) / mocks.length).toFixed(1)}
                            </div>
                            <div className="text-sm text-slate-400 mt-1">Avg Rating</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800/50">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-indigo-400">
                                {mocks[0]?.company || "N/A"}
                            </div>
                            <div className="text-sm text-slate-400 mt-1">Latest Company</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Charts */}
            {mocks.length > 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="bg-slate-900/50 border-slate-800/50">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-400" />
                                Performance Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[0, 10]} />
                                    <RechartsTooltip
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "1px solid #334155",
                                            borderRadius: "12px",
                                            color: "#fff",
                                        }}
                                    />
                                    <Line type="monotone" dataKey="rating" stroke="#eab308" strokeWidth={2} dot={{ fill: "#eab308" }} />
                                    <Line type="monotone" dataKey="technical" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-800/50">
                        <CardHeader>
                            <CardTitle className="text-white text-lg">Skill Radar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                    <PolarRadiusAxis domain={[0, 10]} tick={{ fill: "#475569", fontSize: 9 }} />
                                    <Radar
                                        dataKey="value"
                                        stroke="#6366f1"
                                        fill="#6366f1"
                                        fillOpacity={0.2}
                                        strokeWidth={2}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Mock List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-2xl bg-slate-800/50" />
                    ))}
                </div>
            ) : mocks.length === 0 ? (
                <div className="flex flex-col items-center py-20">
                    <GraduationCap className="w-12 h-12 text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-400 mb-2">No mock interviews yet</h3>
                    <p className="text-slate-600 text-sm mb-6">Record your first mock to start tracking</p>
                    <AddMockDialog />
                </div>
            ) : (
                <div className="space-y-3">
                    {mocks.map((mock: {
                        _id: string; mockNumber: number; date: string; duration: number;
                        rating: number; company: string; interviewer?: string; notes?: string;
                        performance: { technical: number; communication: number; problemSolving: number };
                    }) => (
                        <MockCard key={mock._id} mock={mock} />
                    ))}
                </div>
            )}
        </div>
    );
}
