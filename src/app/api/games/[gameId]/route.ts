import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Game from '@/models/Game';
import Venue from "@/models/Venue"; // Make sure Venue model is imported
import User from "@/models/User";   // Make sure User model is imported
import { ObjectId } from 'mongodb'; // Or mongoose.Types.ObjectId if using Mongoose

interface UpdateGameBody {
    title?: string;
    dateTime?: string;
    venue?: string | null;
    court?: string | null;
    // Add other fields as needed
}

export async function PUT(req: Request, context: { params:  Promise<{ gameId: string }> }) {
    const session = await getServerSession(authOptions);
    const { gameId } = await context.params;

    if (!session?.user?.id) {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        await connectToDatabase();

        // Basic validation - you might want more robust validation
        const body: UpdateGameBody = await req.json();
        const { title, dateTime, venue, court } = body;

        if (!title || !dateTime || !venue) {
            return new NextResponse(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
        }

        const gameToUpdate = await Game.findById(gameId);

        if (!gameToUpdate) {
            return new NextResponse(JSON.stringify({ message: "Game not found" }), { status: 404 });
        }

        // Verify that the logged-in user is the organizer of the game
        if (gameToUpdate.organizer.toString() !== session.user.id) {
            return new NextResponse(JSON.stringify({ message: "You are not authorized to update this game" }), { status: 403 });
        }

        // Assume the dateTime from the client is in the user's local timezone (SAST = UTC+2)
        const localTime = new Date(dateTime);
        // Convert local time to UTC by subtracting the timezone offset
        const utcTime = new Date(localTime.getTime() - localTime.getTimezoneOffset() * 60000);

        const updateData: Partial<Game> = {
            title,
            dateTime: utcTime, // Store as UTC
            venue: venue ? new ObjectId(venue) : null,
            court,
        };

        const updatedGame = await Game.findByIdAndUpdate(gameId, updateData, { new: true });

        if (!updatedGame) {
            return new NextResponse(JSON.stringify({ message: "Failed to update game" }), { status: 500 });
        }

        return NextResponse.json({ message: "Game updated successfully", game: updatedGame });

    } catch (error: any) {
        console.error("Error updating game:", error);
        return new NextResponse(JSON.stringify({ message: "Failed to update game" }), { status: 500 });
    }
}

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

export async function DELETE(req: Request, context: { params:  Promise<{ gameId: string }> }) {
    const session = await getServerSession(authOptions);
    const { gameId } = await context.params;

    if (!session?.user?.id) {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        await connectToDatabase();

        const gameToCancel = await Game.findById(gameId);

        if (!gameToCancel) {
            return new NextResponse(JSON.stringify({ message: "Game not found" }), { status: 404 });
        }

        if (gameToCancel.organizer.toString() !== session.user.id) {
            return new NextResponse(JSON.stringify({ message: "You are not authorized to cancel this game" }), { status: 403 });
        }

        if (gameToCancel.status === 'cancelled') {
            return new NextResponse(JSON.stringify({ message: "Game is already cancelled" }), { status: 400 });
        }

        const updatedGame = await Game.findByIdAndUpdate(
            gameId,
            { status: 'cancelled' },
            { new: true }
        );

        if (!updatedGame) {
            return new NextResponse(JSON.stringify({ message: "Failed to cancel game" }), { status: 500 });
        }

        return NextResponse.json({ message: "Game cancelled successfully", game: updatedGame });

    } catch (error: any) {
        console.error("Error cancelling game:", error);
        return new NextResponse(JSON.stringify({ message: "Failed to cancel game" }), { status: 500 });
    }
}