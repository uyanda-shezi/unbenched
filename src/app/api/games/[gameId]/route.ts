import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Game from '@/models/Game';
import Venue from "@/models/Venue"; // Make sure Venue model is imported
import User from "@/models/User";   // Make sure User model is imported

export async function GET(
    request: Request,
    context: { params:  Promise<{ gameId: string }>  }
) {
    const { gameId } = (await context.params);

    try {
        await connectToDatabase();

        const game = await Game.findById(gameId)
            .populate('venue') // Populate all venue details
            .populate('organizer', '_id name') // Populate organizer's ID and name
            .populate('currentPlayers', '_id name') // Populate current players' IDs and names
            .populate('joinRequests', '_id name')
            .populate('court', '_id name'); // Populate join requests' IDs and names

        if (!game) {
            return new NextResponse(JSON.stringify({ message: 'Game not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return NextResponse.json(game);
    } catch (error: any) {
        console.error('Error fetching game details:', error);
        return new NextResponse(JSON.stringify({ message: 'Failed to fetch game details' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}