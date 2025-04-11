import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Notification from '@/models/Notification';
import User from '@/models/User'; // Import User model (though might not be strictly needed if populated)
import Game from '@/models/Game';   // Import Game model (though might not be strictly needed if populated)

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        await connectToDatabase();

        const userId = session.user.id;

        const notifications = await Notification.find({ recipient: userId, isRead: false })
            .populate({
                path: 'sender',
                select: 'name _id', // Only fetch name and _id of the sender
            })
            .populate({
                path: 'game',
                select: 'title _id', // Only fetch title and _id of the game
            })
            .sort({ createdAt: 'desc' });

        return NextResponse.json(notifications);

    } catch (error: any) {
        console.error("Error fetching notifications:", error);
        return new NextResponse(JSON.stringify({ message: "Failed to fetch notifications" }), { status: 500 });
    }
}