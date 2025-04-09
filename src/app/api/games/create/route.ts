import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Game from '@/models/Game';
import User from '@/models/User';
import Venue from "@/models/Venue";
import Court from "@/models/Court";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    try {
        await connectToDatabase();
        const { title, description, selectedVenueId, selectedCourtId, dateTime, maxPlayers, price, organizerId } = await req.json();

        if (!title || !selectedVenueId || !selectedCourtId || !dateTime || !maxPlayers || !organizerId) {
            return new NextResponse(JSON.stringify({ message: 'Please provide all required fields.' }), { status: 400 });
        }

        const organizer = await User.findById(organizerId);
        const venue = await Venue.findById(selectedVenueId);
        const court = await Court.findById(selectedCourtId);
        if (!organizer) {
            return new NextResponse(JSON.stringify({ message: 'Organizer not found.' }), { status: 400 });
        }

        const newGame = new Game({
            title,
            description,
            venue,
            court,
            dateTime: new Date(dateTime),
            organizer: organizerId,
            maxPlayers: parseInt(maxPlayers, 10),
            price: parseFloat(price),
            currentPlayers: [],
            joinRequests: []
        });

        const savedGame = await newGame.save();

        // Update the organizer's gamesOrganized array
        await User.findByIdAndUpdate(organizerId, { $push: { gamesOrganized: savedGame._id } });

        return NextResponse.json(savedGame, { status: 201 });
    } catch (error: any) {
        console.error('Error creating game:', error);
        return new NextResponse(JSON.stringify({ message: 'Failed to create game.' }), { status: 500 });
    }
}