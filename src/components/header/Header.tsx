'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
    const { data: session } = useSession();

    return (
        <header className="bg-white shadow-md py-4 px-6">
            <nav className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-semibold">Unbenched</Link>
                <div className="flex items-center">
                    <Link href="/games" className="mr-4 hover:underline">Games</Link>
                    {session?.user ? (
                        <>
                            <Link href="/notifications" className="mr-4 hover:underline">Notifications</Link>
                            <Link href="/organizer/manage-games" className="mr-4 hover:underline">Manage Games</Link>
                            <span className="mr-4">Welcome, {session.user.name || session.user.email}</span>
                            <button onClick={() => signOut()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/signin" className="mr-4 hover:underline">Sign In</Link>
                            <Link href="/register" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;