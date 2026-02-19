import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITopic extends Document {
    _id: mongoose.Types.ObjectId;
    subjectId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    order: number;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    estimatedHours?: number;
    timeSpent: number;
    createdAt: Date;
    updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>(
    {
        subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        description: { type: String },
        order: { type: Number, default: 0 },
        difficulty: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner",
        },
        estimatedHours: { type: Number },
        timeSpent: { type: Number, default: 0 },
    },
    { timestamps: true }
);

TopicSchema.index({ subjectId: 1, userId: 1, order: 1 });
TopicSchema.index({ userId: 1 });
TopicSchema.index({ userId: 1, name: 1 });

const Topic: Model<ITopic> =
    mongoose.models.Topic || mongoose.model<ITopic>("Topic", TopicSchema);

export default Topic;
