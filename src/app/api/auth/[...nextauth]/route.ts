import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { compare } from "bcryptjs";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                await connectToDatabase();

                const user = await User.findOne({ email: credentials.email });

                if (!user || (await compare(credentials.password, user.password))) {
                    return null;
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                };
            }
        })
    ],
    callbacks: {
        async session({ session, token }){
            if (token && session.user) {
                session.user.id = token.sub;
            }
            return token;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/signin',
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };