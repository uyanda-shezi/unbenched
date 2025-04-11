import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Game from '@/models/Game';
import mongoose from "mongoose";
import Notification from "@/models/Notification";
import { NotificationType } from "@/enums/NotificationType";

export async function PATCH(
    request: Request,
    context: { params:  Promise<{ gameId: string; userId: string }> }
) {
    const session = await getServerSession(authOptions);
    const { gameId, userId } = await context.params;

    if (!session?.user?.id) {
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

        // Verify that the logged-in user is the organizer of the game
        if (game.organizer.toString() !== session.user.id) {
            return new NextResponse(JSON.stringify({ message: "You are not the organizer of this game" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Check if the user is in the joinRequests
        if (!game.joinRequests.includes(userId)) {
            return new NextResponse(JSON.stringify({ message: "User not found in join requests" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Remove the user from joinRequests
        game.joinRequests = game.joinRequests.filter((id: any) => !new mongoose.Types.ObjectId(id).equals(new mongoose.Types.ObjectId(userId)));
        await game.save();

        await Notification.create({
            recipient: userId,
            sender: session.user.id, // The organizer is the sender of this notification
            game: gameId,
            message: `Has declined your request to join "${game.title}".`,
            isRead: false,
            type: NotificationType.REQUEST_DECLINED,
        });

        return new NextResponse(JSON.stringify({ message: "Request declined" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Error declining join request:", error);
        return new NextResponse(
            JSON.stringify({ message: "Failed to decline join request" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}