import mongoose, { Schema, Document, Types } from 'mongoose';
import { IVenue } from './Venue';

export interface ICourt extends Document {
    venue: Types.ObjectId | IVenue;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

const CourtSchema: Schema = new Schema(
    {
        venue: { type: Schema.Types.ObjectId, ref: 'Venue', required: true },
        name: { type: String, required: true },
    },
    { timestamps: true }
);

const Court = mongoose.models?.Court || mongoose.model<ICourt>('Court', CourtSchema);
export default Court