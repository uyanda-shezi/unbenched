import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Game from '@/models/Game';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    const now = new Date();

    if (!session?.user?.id) {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const organizerId = session.user.id;

    try {
        await connectToDatabase();

        const organizerGames = await Game.find({ organizer: organizerId, // Check if maxPlayers > size of currentPlayers array
            dateTime: { $gt: now },
            status: 'open' // Check if dateTime is in the future
        })
            .populate('venue')
            .populate('court')
            .populate('organizer', 'name _id') // Populate organizer details
            .populate({
                path: 'joinRequests',
                model: 'User',
                select: '_id name', // Fetch _id and name of requesting users
            })
            .populate('currentPlayers', 'name _id') // Populate current players
            .sort({ dateTime: 'asc' });

        return NextResponse.json(organizerGames);
    } catch (error: any) {
        console.error("Error fetching organizer's games:", error);
        return new NextResponse(
            JSON.stringify({ message: "Failed to fetch organizer's games" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}