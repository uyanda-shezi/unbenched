import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { RegistrationFormData, SkillLevel } from "@/types/User";

export async function POST(request: Request) {
    try {
        const body: RegistrationFormData = await request.json();
        const {name, email, password, skillLevel} = body;
        if (!name || !email || !password || !skillLevel) {
            return new NextResponse(JSON.stringify({message: 'All fields required.'}),{
                status: 400,
                headers: {'Content-Type': 'application/json'},
            });
        }

        if (!email.includes('@')) {
            return new NextResponse(JSON.stringify({message: 'Invalid email format.'}),{
                status: 400,
                headers: {'Content-Type': 'application/json'},
            });
        }

        if (password.length < 6) {
            return new NextResponse(JSON.stringify({message: 'Password must be longer than 6 characters.'}),{
                status: 400,
                headers: {'Content-Type': 'application/json'},
            });
        }

        if (!Object.values(SkillLevel).includes(skillLevel)) {
            return new NextResponse(JSON.stringify({message: 'Invalid skill level.'}),{
                status: 400,
                headers: {'Content-Type': 'application/json'},
            });
        }

        await connectToDatabase();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return new NextResponse(JSON.stringify({message: 'Email already registered'}),{
                status: 409,
                headers: {'Content-Type': 'application/json'}
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            skillLevel,
            timeStamp: new Date(),
        })

        await newUser.save();

        return new NextResponse(JSON.stringify({ message: 'Acount created successfully'}), {
            status: 201,
            headers: {'Content-Type': 'application/json'}
        });
    } catch (error: any){
        console.error('Error during registration', error);
        return new NextResponse(JSON.stringify({ message: 'Failed to create account. Please try again later.'}), {
            status: 500,
            headers: {'Content-Type': 'application/json'}
        });
    }
}