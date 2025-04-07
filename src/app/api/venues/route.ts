import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Venue from '@/models/Venue';


export async function GET() {
    try {
        await connectToDatabase();

        const venues = await Venue.find().select('-__v').populate({ path: 'courts', select: 'name' }); // Fetch all venues, exclude __v, and optionally populate courts

        console.log();

        return NextResponse.json(venues);
    } catch (error) {
        console.error('Error fetching venues:', error);
        return new NextResponse(JSON.stringify({ message: 'Failed to fetch venues' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}