import NextAuth, { Session, User as NextAuthUser, Account, Profile } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/db";
import User, { IUser } from "@/models/User";
import { compare } from "bcryptjs";
import { JWT } from "next-auth/jwt";

export const authOptions: {
    providers: any[]; // It's safer to type this more specifically if you add other providers
    callbacks: {
        session: ({ session, token }: { session: Session; token: JWT }) => Promise<Session>;
        jwt: ({ token, user, account, profile, trigger, isNewUser, session }: {
            token: JWT;
            user?: NextAuthUser | IUser; // Allow either NextAuth's User or your IUser
            account: Account | null;
            profile?: Profile;
            trigger?: "signIn" | "signUp" | "update";
            isNewUser?: boolean;
            session?: any; // Deprecated in jwt callback
        }) => Promise<JWT>;
    };
    pages: {
        signIn: string;
    };
} = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                if (!/\S+@\S+\.\S+/.test(credentials.email)) {
                    console.log(`[Server] Invalid email format: ${credentials.email}`);
                    return null;
                }
                if (credentials.password.length < 6) {
                    console.log("[Server] Password too short");
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
                    return user; // Return the full user object
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session?.user && token.sub) {
                await connectToDatabase();
                const dbUser = await User.findById(token.sub);
                if (dbUser) {
                    session.user.id = dbUser._id.toString();
                    session.user.role = dbUser.role;
                    // Add other properties from dbUser to session.user if needed
                }
            }
            return session;
        },
        async jwt({ token, user, account, profile, trigger, isNewUser, session }) {
            if (user) {
                token.sub = (user as IUser)._id.toString(); // Explicitly cast to IUser here
                console.log("token", token.sub)
            }
            return token;
        },
    },
    pages: {
        signIn: "/signin",
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };