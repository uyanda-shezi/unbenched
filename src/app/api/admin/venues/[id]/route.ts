import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import Venue from '@/models/Venue';
import Court from '@/models/Court';
import { isValidObjectId } from 'mongoose';

// TODO: Check adding a new court to a venue
interface UpdateRequestBody {
    name?: string;
    address?: string;
    courts?: string[];
}

export async function GET(req: Request, context: { params:  Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== 'admin') {
        return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { id } = (await context.params);

    if(!isValidObjectId(id)){
        return new NextResponse(JSON.stringify({ message: 'Invalid Venue ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        
        await connectToDatabase();

        const venue = await Venue.findById(id).populate('courts', '_id name'); // Populate courts with their IDs and names

        if (!venue) {
            return new NextResponse(JSON.stringify({ message: 'Venue not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return NextResponse.json(venue);
    } catch (error) {
        console.error('Error fetching venue:', error);
        return new NextResponse(JSON.stringify({ message: 'Failed to fetch venue' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function PUT(req: Request, context: { params:  Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const venueId = (await context.params).id;

    if (!session?.user?.role || session.user.role !== 'admin') {
        return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (!isValidObjectId(venueId)) {
        return new NextResponse(JSON.stringify({ message: 'Invalid Venue ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        await connectToDatabase();
        const body: UpdateRequestBody = await req.json();

        const updatedVenue = await Venue.findByIdAndUpdate(venueId, body, { new: true });

        if (!updatedVenue) {
            return new NextResponse(JSON.stringify({ message: 'Venue not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new NextResponse(JSON.stringify(updatedVenue), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating venue:', error);
        return new NextResponse(JSON.stringify({ message: 'Failed to update venue' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function DELETE(req: Request, context: { params:  Promise<{ id: string }>}) {
    const session = await getServerSession(authOptions);
    const venueId = (await context.params).id;

    if (!session?.user?.role || session.user.role !== 'admin') {
        return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (!isValidObjectId(venueId)) {
        return new NextResponse(JSON.stringify({ message: 'Invalid Venue ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        await connectToDatabase();

        // Find the venue to get the associated court IDs
        const venueToDelete = await Venue.findById(venueId);

        if (!venueToDelete) {
            return new NextResponse(JSON.stringify({ message: 'Venue not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Delete the associated courts
        await Court.deleteMany({ venue: venueId });

        // Delete the venue itself
        const deletedVenue = await Venue.findByIdAndDelete(venueId);

        if (!deletedVenue) {
            // This should ideally not happen if we found it above, but for extra safety
            return new NextResponse(JSON.stringify({ message: 'Failed to delete venue' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new NextResponse(JSON.stringify({ message: 'Venue and associated courts deleted successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error deleting venue and courts:', error);
        return new NextResponse(JSON.stringify({ message: 'Failed to delete venue and associated courts' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}