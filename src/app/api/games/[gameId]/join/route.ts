import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Game from '@/models/Game';
import Notification from '@/models/Notification'; // Import the Notification model
import User from '@/models/User'; // Import the User model
import { NotificationType } from "@/enums/NotificationType";

export async function POST(
    request: Request,
    context: { params: Promise<{ gameId: string }> }
) {
    const session = await getServerSession(authOptions);
    const { gameId } = await context.params;
    const { userId } = await request.json();

    if (!session?.user?.id || session.user.id !== userId) {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        await connectToDatabase();

        const game = await Game.findById(gameId).populate('organizer'); // Populate the organizer to access their _id

        if (!game) {
            return new NextResponse(JSON.stringify({ message: "Game not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (game.currentPlayers.includes(userId) || game.joinRequests.includes(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "You have already joined or requested to join this game" }),
                { status: 409, headers: { "Content-Type": "application/json" } }
            );
        }

        game.joinRequests.push(userId);
        await game.save();

        // Create a new notification for the organizer
        const newNotification = new Notification({
            recipient: game.organizer._id, // Use the populated organizer's _id
            sender: userId,
            game: gameId,
            type: NotificationType.JOIN_REQUEST,
            message: `${session.user.name} has requested to join your game: ${game.title}`,
        });
        await newNotification.save();

        return new NextResponse(JSON.stringify({ message: "Request to join sent successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Error requesting to join game:", error);
        return new NextResponse(
            JSON.stringify({ message: "Failed to request to join game" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}