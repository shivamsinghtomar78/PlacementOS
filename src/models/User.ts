import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    firebaseUid: string;
    email: string;
    name: string;
    image?: string;
    placementDeadline?: Date;
    targetCompanies: string[];
    preferences: {
        theme: "light" | "dark";
        dailyTarget: number;
        focusMode: boolean;
        notifications: boolean;
        placementMode: boolean;
        activeTrack: "placement" | "sarkari";
        sarkariDepartment: "mechanical" | "computer-science" | "ece" | "ec";
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        firebaseUid: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        image: { type: String },
        placementDeadline: { type: Date },
        targetCompanies: [{ type: String }],
        preferences: {
            theme: { type: String, enum: ["light", "dark"], default: "dark" },
            dailyTarget: { type: Number, default: 5 },
            focusMode: { type: Boolean, default: false },
            notifications: { type: Boolean, default: true },
            placementMode: { type: Boolean, default: false },
            activeTrack: { type: String, enum: ["placement", "sarkari"], default: "placement" },
            sarkariDepartment: { type: String, enum: ["mechanical", "computer-science", "ece", "ec"], default: "mechanical" },
        },
    },
    { timestamps: true }
);

UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ email: 1 });

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
