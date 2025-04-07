import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVenue extends Document {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    courts: Types.ObjectId[] | ICourt[];
    createdAt: Date;
    updatedAt: Date;
}

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

const VenueSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        courts: [{ type: Types.ObjectId, ref: 'Court' }],
    },
    { timestamps: true }
);

const Venue = mongoose.models?.Venue || mongoose.model<IVenue>('Venue', VenueSchema);

export { Court, CourtSchema }; // Export Court and CourtSchema if needed elsewhere
export default Venue;