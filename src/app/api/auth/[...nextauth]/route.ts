import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { compare } from "bcryptjs";

const handler = NextAuth({providers: [
    CredentialsProvider({
        name: "credentials",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
                return null;
            }

            // Server-side email format validation
            if (!/\S+@\S+\.\S+/.test(credentials.email)) {
                console.log(`[Server] Invalid email format: ${credentials.email}`);
                return null;
            }

            // Optional: Server-side password length validation
            if (credentials.password.length < 6) { // Example minimum length
                console.log('[Server] Password too short');
                return null;
            }

            await connectToDatabase();

            const user = await User.findOne({ email: credentials.email });

            if (!user) {
                console.log(`[Server] User not found for email: ${credentials.email}`);
                return null;
            } else {
                const matchedPassword = await compare(credentials.password, user.password);
                if (!matchedPassword) {
                    console.log(`[Server] Incorrect password for user: ${credentials.email}`);
                    return null;
                }
            }

            return {
                id: user._id.toString(),
                email: user.email,
            };
        },
    }),
], pages: { signIn: "/signin"}

});

export { handler as GET, handler as POST};