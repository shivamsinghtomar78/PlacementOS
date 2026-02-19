import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResource {
    _id?: mongoose.Types.ObjectId;
    type: "Video" | "Article" | "Playlist" | "Book" | "Code" | "Other";
    platform: "YouTube" | "Udemy" | "LeetCode" | "GeeksforGeeks" | "Neetcode" | "Other";
    url: string;
    title: string;
    duration?: number;
    quality: number;
    completed: boolean;
    notes?: string;
    addedDate: Date;
}

export interface ISession {
    sessionDate: Date;
    duration: number;
    notes?: string;
}

export interface IRevision {
    learned: boolean;
    revised1: boolean;
    revised2: boolean;
    revised3: boolean;
    finalRevised: boolean;
    learnedDate?: Date;
    revised1Date?: Date;
    revised2Date?: Date;
    revised3Date?: Date;
    finalRevisedDate?: Date;
    lastRevisedDate?: Date;
}

export interface ISubtopic extends Document {
    _id: mongoose.Types.ObjectId;
    topicId: mongoose.Types.ObjectId;
    subjectId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    status: 0 | 1 | 2;
    notes?: string;
    order: number;
    revision: IRevision;
    resources: IResource[];
    companyTags: string[];
    resumeAligned: boolean;
    timeSpent: number;
    sessions: ISession[];
    createdAt: Date;
    updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>({
    type: {
        type: String,
        enum: ["Video", "Article", "Playlist", "Book", "Code", "Other"],
        default: "Other",
    },
    platform: {
        type: String,
        enum: ["YouTube", "Udemy", "LeetCode", "GeeksforGeeks", "Neetcode", "Other"],
        default: "Other",
    },
    url: { type: String, required: true },
    title: { type: String, required: true },
    duration: { type: Number },
    quality: { type: Number, min: 1, max: 5, default: 3 },
    completed: { type: Boolean, default: false },
    notes: { type: String },
    addedDate: { type: Date, default: Date.now },
});

const SessionSchema = new Schema<ISession>({
    sessionDate: { type: Date, default: Date.now },
    duration: { type: Number, required: true },
    notes: { type: String },
});

const RevisionSchema = new Schema<IRevision>(
    {
        learned: { type: Boolean, default: false },
        revised1: { type: Boolean, default: false },
        revised2: { type: Boolean, default: false },
        revised3: { type: Boolean, default: false },
        finalRevised: { type: Boolean, default: false },
        learnedDate: { type: Date },
        revised1Date: { type: Date },
        revised2Date: { type: Date },
        revised3Date: { type: Date },
        finalRevisedDate: { type: Date },
        lastRevisedDate: { type: Date },
    },
    { _id: false }
);

const SubtopicSchema = new Schema<ISubtopic>(
    {
        topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
        subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        description: { type: String },
        status: { type: Number, enum: [0, 1, 2], default: 0 },
        notes: { type: String },
        order: { type: Number, default: 0 },
        revision: { type: RevisionSchema, default: () => ({}) },
        resources: [ResourceSchema],
        companyTags: [{ type: String }],
        resumeAligned: { type: Boolean, default: false },
        timeSpent: { type: Number, default: 0 },
        sessions: [SessionSchema],
    },
    { timestamps: true }
);

SubtopicSchema.index({ topicId: 1, userId: 1, order: 1 });
SubtopicSchema.index({ userId: 1 });
SubtopicSchema.index({ subjectId: 1, userId: 1 });
SubtopicSchema.index({ status: 1 });
SubtopicSchema.index({ userId: 1, name: 1 });

const Subtopic: Model<ISubtopic> =
    mongoose.models.Subtopic || mongoose.model<ISubtopic>("Subtopic", SubtopicSchema);

export default Subtopic;
