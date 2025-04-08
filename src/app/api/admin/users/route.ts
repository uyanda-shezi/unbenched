import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== 'admin') {
        return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        await connectToDatabase();
        const users = await User.find().select('-password'); // Exclude password for security

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return new NextResponse(JSON.stringify({ message: 'Failed to fetch users' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== 'admin') {
        return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        await connectToDatabase();
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password || !role) {
            return new NextResponse(JSON.stringify({ message: 'Please provide all required fields.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if a user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return new NextResponse(JSON.stringify({ message: 'User with this email already exists.' }), {
                status: 409, // Conflict
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
        });

        const savedUser = await newUser.save();

        const fetchedNewUser = await User.findById(savedUser._id).select('-password').lean();

        if (!fetchedNewUser) {
            return new NextResponse(JSON.stringify({ message: 'Failed to retrieve created user.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return NextResponse.json(fetchedNewUser, {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Error creating user:', error);
        return new NextResponse(JSON.stringify({ message: 'Failed to create user.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}