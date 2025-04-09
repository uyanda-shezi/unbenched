import { Venue } from "@/types/Venue";
import { Court } from "@/types/Court";
import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

//Define interface
export interface IGame extends Document {
    title: string;
    description: string;
    venue: Venue;
    court: Court;
    dateTime: Date;
    organizer: mongoose.Types.ObjectId;
    maxPlayers: number;
    currentPlayers: mongoose.Types.ObjectId[] | IUser[];
    joinRequests: mongoose.Types.ObjectId[] | IUser[];
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

//Create Game schema
const GameSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        venue: {type: Schema.Types.ObjectId, ref: 'Venue'},
        court: {type: Schema.Types.ObjectId, ref: 'Court'},
        dateTime: { type: Date, required: true },
        organizer: { type:Schema.Types.ObjectId, ref: 'User', required: true },
        maxPlayers: { type: Number, default: 10 },
        currentPlayers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        joinRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        price: { type: Number, default: 0 },
    },
    { timestamps: true }
);

//Check if model already exists
export default mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema);