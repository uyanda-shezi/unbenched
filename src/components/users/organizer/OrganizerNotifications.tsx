'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Game } from '@/types/Game';

interface OrganizerNotificationsProps {
    notifications: Game[];
    onNotificationsUpdated: () => void; // Callback to trigger refetch in parent
}

const OrganizerNotifications: React.FC<OrganizerNotificationsProps> = ({ notifications: initialNotifications, onNotificationsUpdated }) => {
    const [notifications, setNotifications] = useState<Game[]>(initialNotifications);
    const [actionLoading, setActionLoading] = useState<{ gameId: string | null; userId: string | null; action: 'approve' | 'decline' | null }>(
        { gameId: null, userId: null, action: null }
    );
    const [actionError, setActionError] = useState<string | null>(null);
    const { data: session } = useSession();

    const handleApprove = async (gameId: string, userId: string) => {
        if (!session?.user?.id) return;

        setActionLoading({ gameId, userId, action: 'approve' });
        setActionError(null);

        console.log('Approving/Declining user ID:', userId)

        try {
            const response = await fetch(`/api/games/${gameId}/requests/${userId}/approve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || 'Failed to approve request');
            }

            // Refetch notifications from the server
            onNotificationsUpdated();
        } catch (err: any) {
            setActionError(err.message);
        } finally {
            setActionLoading({ gameId: null, userId: null, action: null });
        }
    };

    const handleDecline = async (gameId: string, userId: string) => {
        if (!session?.user?.id) return;

        setActionLoading({ gameId, userId, action: 'decline' });
        setActionError(null);

        console.log('Approving/Declining user ID:', userId)

        try {
            const response = await fetch(`/api/games/${gameId}/requests/${userId}/decline`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || 'Failed to decline request');
            }

            // Refetch notifications from the server
            onNotificationsUpdated();
        } catch (err: any) {
            setActionError(err.message);
        } finally {
            setActionLoading({ gameId: null, userId: null, action: null });
        }
    };

    if (!notifications || notifications.length === 0) {
        return <div className="p-4 text-gray-600">No new join requests.</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Join Requests</h2>
            <ul className="space-y-4">
                {notifications.map((game) => (
                    <li key={game._id} className="bg-white shadow rounded-md p-4">
                        <h3 className="font-semibold mb-2">{game.title} at <span className="text-blue-500">{game.venue?.name}</span></h3>
                        <ul className="mt-2 space-y-2">
                            {game.joinRequests?.map((user: any) => (
                                <li key={user._id} className="flex items-center justify-between">
                                    <span className="font-medium">{user.name}</span>
                                    <div>
                                        <button
                                            onClick={() => handleApprove(game._id, user._id)}
                                            disabled={actionLoading.gameId === game._id && actionLoading.userId === user._id && actionLoading.action === 'approve'}
                                            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-3 rounded mr-2 ${actionLoading.gameId === game._id && actionLoading.userId === user._id && actionLoading.action === 'approve' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {actionLoading.gameId === game._id && actionLoading.userId === user._id && actionLoading.action === 'approve' ? 'Approving...' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => handleDecline(game._id, user._id)}
                                            disabled={actionLoading.gameId === game._id && actionLoading.userId === user._id && actionLoading.action === 'decline'}
                                            className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded ${actionLoading.gameId === game._id && actionLoading.userId === user._id && actionLoading.action === 'decline' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {actionLoading.gameId === game._id && actionLoading.userId === user._id && actionLoading.action === 'decline' ? 'Declining...' : 'Decline'}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
            {actionError && <p className="mt-2 text-red-500">{actionError}</p>}
        </div>
    );
};

export default OrganizerNotifications;