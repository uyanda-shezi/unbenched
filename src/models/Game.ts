import { NumericType } from "mongodb";
import mongoose, { Schema, Document } from "mongoose";
import { title } from "process";

//Define interface
export interface IGame extends Document {
    title: string;
    description: string;
    location: {
        type: string;
        coordinates: [number, number];
        address: string
    };
    dateTime: Date;
    organizer: mongoose.Types.ObjectId;
    maxPlayers: number;
    currentPlayers: mongoose.Types.ObjectId[];
    joinRequests: mongoose.Types.ObjectId[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

//Create Game schema
const GameSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], //[longitude, latitude]
                required: true
            },
            address: { type: String, required: true },
        },
        datetime: { type: String, required: true },
        organizer: { type:Schema.Types.ObjectId, ref: 'User', required: true },
        maxPlayers: { type: Number, default: 10 },
        currentPlayers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        joinRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        skillLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner',
        },
        price: { type: Number, default: 0 },
    },
    { timestamps: true }
);

//Create GeoSpatial index for location-based queries
GameSchema.index({ 'location.coordinates': '2dsphere' });

//Check if model already exists
export default mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema);