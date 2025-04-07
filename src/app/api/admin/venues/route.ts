import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import Venue, { Court } from '@/models/Venue';

interface RequestBody {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    courtNames: string[];
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== 'admin') {
        return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        await connectToDatabase();
        const body: RequestBody = await req.json(); // Explicitly type the parsed body

        const { name, address, latitude, longitude, courtNames } = body; // These will inherit types from RequestBody

        if (!name || !address || typeof latitude !== 'number' || typeof longitude !== 'number' || !Array.isArray(courtNames)) {
            return new NextResponse(JSON.stringify({ message: 'Invalid request body: Missing required fields or incorrect types' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const newVenue = new Venue({ name, address, latitude, longitude, courts: []});
        const savedVenue = await newVenue.save();

        const createdCourtIds: string[] = [];
        for (const courtName of courtNames) {
            const newCourt = new Court({ venue: savedVenue._id, name: courtName });
            const savedCourt = await newCourt.save();
            savedVenue.courts.push(savedCourt._id);
            createdCourtIds.push(savedCourt._id.toString());
        }

        await savedVenue.save(); // Save the venue with the array of court IDs

        return new NextResponse(JSON.stringify({ venue: savedVenue, courtIds: createdCourtIds }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error creating venue and courts:', error);
        return new NextResponse(JSON.stringify({ message: 'Failed to create venue and courts' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}