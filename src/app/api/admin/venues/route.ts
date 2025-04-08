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
    courtNamesList: string[];
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
        const { name, address, latitude, longitude, courtNamesList } = await req.json();

        if (!name || !address || typeof latitude !== 'number' || typeof longitude !== 'number' || !Array.isArray(courtNamesList)) {
            console.log("Court Names: ", courtNamesList)
            return new NextResponse(JSON.stringify({ message: 'Invalid request body: Missing required fields or incorrect types' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const newVenue = new Venue({ name, address, latitude, longitude});
        const savedVenue = await newVenue.save();

        const createdCourts = await Promise.all(
            courtNamesList.map(courtName => new Court({ name: courtName, venue: savedVenue._id }).save())
        );

        savedVenue.courts = createdCourts.map(court => court._id);
        await savedVenue.save();

        const populatedVenue = await Venue.findById(savedVenue._id).populate('courts', '_id name');

        return new NextResponse(JSON.stringify({ venue: populatedVenue }), {
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