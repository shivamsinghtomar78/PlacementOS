import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDailyProgress extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    date: Date;
    subtopicsCompleted: number;
    topicsCompleted: number;
    timeSpent: number;
    sessionsCount: number;
    createdAt: Date;
}

const DailyProgressSchema = new Schema<IDailyProgress>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        date: { type: Date, required: true },
        subtopicsCompleted: { type: Number, default: 0 },
        topicsCompleted: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 0 },
        sessionsCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

DailyProgressSchema.index({ userId: 1, date: -1 }, { unique: true });

const DailyProgress: Model<IDailyProgress> =
    mongoose.models.DailyProgress ||
    mongoose.model<IDailyProgress>("DailyProgress", DailyProgressSchema);

export default DailyProgress;
