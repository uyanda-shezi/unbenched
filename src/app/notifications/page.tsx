'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Game } from '@/types/Game';
import OrganizerNotifications from '@/components/users/organizer/OrganizerNotifications';

const NotificationPage = () => {
    const [notifications, setNotifications] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session } = useSession();

    const fetchNotifications = useCallback(async () => {
        if (!session?.user?.id) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await fetch('/api/notifications');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || 'Failed to fetch notifications');
            }
            const data = await response.json();
            setNotifications(data);
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    if (loading) {
        return <div className="p-4">Loading notifications...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    if (!notifications || notifications.length === 0) {
        return <div className="p-4 text-gray-600">No new join requests.</div>;
    }

    return (
        <OrganizerNotifications notifications={notifications} onNotificationsUpdated={fetchNotifications} />
    );
};

export default NotificationPage;