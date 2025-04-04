import mongoose, { Schema, Document, mongo } from "mongoose";
import { unique } from "next/dist/build/utils";

export interface IUser extends Document {
    name: string;
    email: string;
    image?: string;
    gamesOrganized: mongoose.Types.ObjectId[];
    gamesJoined: mongoose.Types.ObjectId[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type:String, required: true, unique: true },
        image: { type: String},
        gamesOrganized: { type: Schema.Types.ObjectId, ref: 'Game' },
        gamesJoined: { type: Schema.Types.ObjectId, ref: 'Game' },
        skillLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner'
        },
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);