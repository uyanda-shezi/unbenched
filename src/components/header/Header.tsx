'use client';

import React, { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import NotificationBell from '../notifications/NotificationBell';

const Header = () => {
    const { data: session } = useSession();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        if (session?.user?.id) {
            try {
                const response = await fetch('/api/notifications/count');
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Failed to fetch unread notification count:', errorData?.message);
                    return;
                }
                const count = await response.json();
                setUnreadCount(count);
            } catch (err: any) {
                console.error('Error fetching unread notification count:', err);
            }
        } else {
            setUnreadCount(0);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    return (
        <header className="bg-white shadow-md py-4 px-6">
            <nav className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-semibold">Unbenched</Link>
                <div className="flex items-center">
                    <Link href="/games" className="mr-4 hover:underline">Games</Link>
                    {session?.user ? (
                        <>
                            <NotificationBell unreadCount={unreadCount} onNotificationClick={fetchUnreadCount} />
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