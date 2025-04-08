import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function DELETE(
    req: Request,
    context: { params:  Promise<{ id: string }>}
) {
    const session = await getServerSession(authOptions);
    const userIdToDelete = (await context.params).id;

    if (!session?.user?.role || session.user.role !== 'admin') {
        return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        await connectToDatabase();

        const deletedUser = await User.findByIdAndDelete(userIdToDelete);

        if (!deletedUser) {
            return new NextResponse(JSON.stringify({ message: 'User not found.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new NextResponse(null, { status: 204 }); // No content on successful deletion
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return new NextResponse(JSON.stringify({ message: 'Failed to delete user.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function PUT(
    req: Request,
    context: { params:  Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const userIdToUpdate = (await context.params).id

    if (!session?.user?.role || session.user.role !== 'admin') {
        return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        await connectToDatabase();
        const { name, email, role } = await req.json();

        if (!name || !email || !role) {
            return new NextResponse(JSON.stringify({ message: 'Please provide all required fields.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const existingUserWithEmail = await User.findOne({ email, _id: { $ne: userIdToUpdate } });
        if (existingUserWithEmail) {
            return new NextResponse(JSON.stringify({ message: 'Email address already in use.' }), {
                status: 409, // Conflict
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userIdToUpdate,
            { name, email, role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return new NextResponse(JSON.stringify({ message: 'User not found.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return NextResponse.json(updatedUser, {
            status: 200, // OK
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Error updating user:', error);
        return new NextResponse(JSON.stringify({ message: 'Failed to update user.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}