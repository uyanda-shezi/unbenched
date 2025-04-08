import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Venue from '@/models/Venue';
import { isValidObjectId } from 'mongoose';

export async function GET(req: Request, context: { params:  Promise<{ id: string }> }) {


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