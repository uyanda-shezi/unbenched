import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: {
      id: string; // Add the 'id' property
      role: string; // Add the 'role' property
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } | null;
    expires: string;
  }

  interface User extends DefaultUser {
    id: string; // Include the id (often provided by the adapter)
    role: string; // Add the role property
    // Add other properties from your IUser that you might use within NextAuth callbacks
    // For example:
    // skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  }
}