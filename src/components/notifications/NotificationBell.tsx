'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Notification {
    _id: string;
    sender: { _id: string; name: string } | null;
    game: { _id: string; title: string };
    message: string;
    isRead: boolean;
    createdAt: string;
}

interface Props {
    unreadCount: number;
    onNotificationClick: () => void;
}

const NotificationBell: React.FC<Props> = ({ unreadCount, onNotificationClick }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null); // Ref for the dropdown container
    const bellRef = useRef<HTMLButtonElement>(null);   // Ref for the bell button

    useEffect(() => {
        const fetchNotifications = async () => {
            if (session?.user?.id) {
                setLoading(true);
                setError(null);
                try {
                    const response = await fetch('/api/notifications');
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData?.message || 'Failed to fetch notifications');
                    }
                    const data: Notification[] = await response.json();
                    setNotifications(data.filter(notification => !notification.isRead));
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchNotifications();
    }, [session?.user?.id]);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleNotificationClick = (event: React.MouseEvent, notificationId: string, href: string) => {
        event.preventDefault();
        markAsRead(notificationId).then(() => {
            window.location.href = href;
        });
    };

    const markAsRead = async (notificationId: string) => {
        console.log(notificationId);
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isRead: true }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to mark notification as read:', errorData?.message);
                return;
            }

            console.log(response);

            setNotifications(prevNotifications =>
                prevNotifications.map(n =>
                    n._id === notificationId ? { ...n, isRead: true } : n
                )
            );

            onNotificationClick();
        } catch (error: any) {
            console.error('Error marking notification as read:', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showDropdown && bellRef.current && !bellRef.current.contains(event.target as Node) && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside); // Clean up the event listener
        };
    }, [showDropdown]);

    return (
        <div className="relative">
            <button
                ref={bellRef}
                onClick={toggleDropdown}
                className="p-2 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-6-6C6.91 5 5 6.91 5 11v3.158a2.032 2.032 0 01-1.405 1.405L4 17h5m6 0v1a3 3 0 01-3 3H9a3 3 0 01-3-3v-1m6 0h6" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div ref={dropdownRef} className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-md rounded-md z-10">
                    <div className="py-2">
                        {loading ? (
                            <div className="px-4 py-2 text-sm text-gray-600">Loading notifications...</div>
                        ) : error ? (
                            <div className="px-4 py-2 text-sm text-red-500">Error: {error}</div>
                        ) : notifications.length === 0 ? (
                            <div className="px-4 py-2 text-sm text-gray-600">No new notifications.</div>
                        ) : (
                            notifications.map(notification => (
                                <Link
                                    key={notification._id}
                                    href={`/organizer/manage-games`}
                                    className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer ${notification.isRead ? 'bg-gray-50' : ''}`}
                                    onClick={(event) => handleNotificationClick(event, notification._id, `/organizer/manage-games`)}
                                >
                                    <p><strong>{notification.sender?.name || 'A player'}</strong> {notification.message}</p>
                                    <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;