export const SUBJECT_ICONS = ["??", "??", "??", "??", "??", "??", "??", "??", "?", "??", "??", "???"];

export const SUBJECT_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308",
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#a855f7", "#6b7280",
];

export const REVISION_LABELS = [
  { field: "learned", label: "Learned", days: 0 },
  { field: "revised1", label: "Rev 1", days: 1 },
  { field: "revised2", label: "Rev 2", days: 3 },
  { field: "revised3", label: "Rev 3", days: 7 },
  { field: "finalRevised", label: "Final", days: 30 },
] as const;

export type SubjectItem = {
  _id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
};

export type TopicItem = {
  _id: string;
  name: string;
  difficulty: string;
};

export type SubtopicItem = {
  _id: string;
  name: string;
  status: number;
  notes?: string;
  revision: Record<string, boolean>;
  companyTags: string[];
  resumeAligned: boolean;
  timeSpent: number;
};
