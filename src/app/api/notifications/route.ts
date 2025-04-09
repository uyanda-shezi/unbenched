import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Game from '@/models/Game';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const organizerId = session.user.id;

    try {
        await connectToDatabase();

        const notifications = await Game.find({
            organizer: organizerId,
            joinRequests: { $not: { $size: 0 } } // Find games with at least one join request
        })
            .populate('venue', 'name')
            .populate('court', 'name') // Populate venue name
            .populate('joinRequests', '_id name'); // Populate details of users who requested to join

        return NextResponse.json(notifications);
    } catch (error: any) {
        console.error("Error fetching join requests:", error);
        return new NextResponse(
            JSON.stringify({ message: "Failed to fetch join requests" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}