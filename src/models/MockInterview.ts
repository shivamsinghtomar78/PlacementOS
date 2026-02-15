import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWeakArea {
    topicId?: mongoose.Types.ObjectId;
    subtopicId?: mongoose.Types.ObjectId;
    feedback: string;
}

export interface IMockInterview extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    mockNumber: number;
    date: Date;
    duration: number;
    rating: number;
    company: string;
    interviewer?: string;
    performance: {
        technical: number;
        communication: number;
        problemSolving: number;
    };
    weakAreas: IWeakArea[];
    notes?: string;
    recordingLink?: string;
    linkedProblems: string[];
    createdAt: Date;
}

const WeakAreaSchema = new Schema<IWeakArea>(
    {
        topicId: { type: Schema.Types.ObjectId, ref: "Topic" },
        subtopicId: { type: Schema.Types.ObjectId, ref: "Subtopic" },
        feedback: { type: String, required: true },
    },
    { _id: false }
);

const MockInterviewSchema = new Schema<IMockInterview>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        mockNumber: { type: Number, required: true },
        date: { type: Date, required: true },
        duration: { type: Number, required: true },
        rating: { type: Number, min: 1, max: 10, required: true },
        company: { type: String, required: true },
        interviewer: { type: String },
        performance: {
            technical: { type: Number, min: 1, max: 10, default: 5 },
            communication: { type: Number, min: 1, max: 10, default: 5 },
            problemSolving: { type: Number, min: 1, max: 10, default: 5 },
        },
        weakAreas: [WeakAreaSchema],
        notes: { type: String },
        recordingLink: { type: String },
        linkedProblems: [{ type: String }],
    },
    { timestamps: true }
);

MockInterviewSchema.index({ userId: 1, date: -1 });

const MockInterview: Model<IMockInterview> =
    mongoose.models.MockInterview ||
    mongoose.model<IMockInterview>("MockInterview", MockInterviewSchema);

export default MockInterview;
