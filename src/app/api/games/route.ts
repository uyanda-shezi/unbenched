import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Game from '@/models/Game';

export async function GET(req: Request) {
    try {
        await connectToDatabase();

        const now = new Date();

        const games = await Game.find({
            $expr: { $gt: ['$maxPlayers', { $size: '$currentPlayers' }] }, // Check if maxPlayers > size of currentPlayers array
            dateTime: { $gt: now },
            status: 'open' // Check if dateTime is in the future
        })
            .populate('venue', 'name address')
            .populate('court', 'name')
            .populate('currentPlayers', '_id name')
            .populate('organizer', '_id name')
            .sort({ startDateTime: 1 });

        return NextResponse.json(games);
    } catch (error: any) {
        console.error('Error fetching games:', error);
        return new NextResponse(JSON.stringify({ message: 'Failed to fetch games.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}