import mongoose, { Schema, Document, Types } from 'mongoose';
import { ICourt } from './Court';

export interface IVenue extends Document {
    name: string;
    address: string;
    courts: Types.ObjectId[] | ICourt[];
    createdAt: Date;
    updatedAt: Date;
}
const VenueSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        courts: [{ type: Types.ObjectId, ref: 'Court' }],
    },
    { timestamps: true }
);

const Venue = mongoose.models?.Venue || mongoose.model<IVenue>('Venue', VenueSchema);
export default Venue;