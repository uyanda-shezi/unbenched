import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Game from '@/models/Game';

export async function GET(req: Request) {
    try {
        await connectToDatabase();

        const games = await Game.find({})
            .populate('venue', 'name address') // Populate the 'venue' field and select the 'name' and 'address'
            .populate('currentPlayers', '_id name') // Populate the 'currentPlayers' field
            .populate('organizer', '_id name') // Populate the organizer's name
            .sort({ startDateTime: 1 }); // Sort games by startDateTime in ascending order (optional)

        return NextResponse.json(games);
    } catch (error: any) {
        console.error('Error fetching games:', error);
        return new NextResponse(JSON.stringify({ message: 'Failed to fetch games.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}