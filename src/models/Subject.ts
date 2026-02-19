import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubject extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    icon: string;
    color: string;
    order: number;
    targetCompletionDate?: Date;
    estimatedHours?: number;
    createdAt: Date;
    updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        description: { type: String },
        icon: { type: String, default: "📚" },
        color: { type: String, default: "#6366f1" },
        order: { type: Number, default: 0 },
        targetCompletionDate: { type: Date },
        estimatedHours: { type: Number },
    },
    { timestamps: true }
);

SubjectSchema.index({ userId: 1, order: 1 });
SubjectSchema.index({ userId: 1, name: 1 });

const Subject: Model<ISubject> =
    mongoose.models.Subject || mongoose.model<ISubject>("Subject", SubjectSchema);

export default Subject;
