import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Notification from '@/models/Notification';
import mongoose from "mongoose";

export async function PATCH(
    request: Request,
    { params }: { params: { notificationId: string } }
) {
    const session = await getServerSession(authOptions);
    const { notificationId } = params;

    if (!session?.user?.id) {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        await connectToDatabase();

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return new NextResponse(JSON.stringify({ message: "Notification not found" }), { status: 404 });
        }

        // Ensure the logged-in user is the recipient of the notification
        if (notification.recipient.toString() !== session.user.id) {
            return new NextResponse(JSON.stringify({ message: "Not authorized to update this notification" }), { status: 403 });
        }

        const { isRead } = await request.json();

        const updatedNotification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead },
            { new: true } // Return the updated document
        );

        return NextResponse.json(updatedNotification);

    } catch (error: any) {
        console.error("Error updating notification read status:", error);
        return new NextResponse(JSON.stringify({ message: "Failed to update notification status" }), { status: 500 });
    }
}