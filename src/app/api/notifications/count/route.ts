import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Notification from '@/models/Notification';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        await connectToDatabase();

        const userId = session.user.id;

        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            isRead: false,
        });

        return NextResponse.json(unreadCount);

    } catch (error: any) {
        console.error("Error fetching unread notification count:", error);
        return new NextResponse(JSON.stringify({ message: "Failed to fetch notification count" }), { status: 500 });
    }
}