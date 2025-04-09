import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Game from '@/models/Game';

export async function POST(
    request: Request,
    context: { params:  Promise<{ gameId: string }>  }
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

        const game = await Game.findById(gameId);

        if (!game) {
            return new NextResponse(JSON.stringify({ message: "Game not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Check if the user is already in the game or has requested to join
        if (game.currentPlayers.includes(userId) || game.joinRequests.includes(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "You have already joined or requested to join this game" }),
                { status: 409, headers: { "Content-Type": "application/json" } }
            );
        }

        // Add the user's ID to the joinRequests array
        game.joinRequests.push(userId);
        await game.save();

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