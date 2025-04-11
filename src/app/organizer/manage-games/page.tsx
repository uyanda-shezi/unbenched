'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Game } from '@/types/Game';
import Link from 'next/link';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface Props {
    onUnreadCountUpdate: () => void;
}

const ManageGamesPage = () => {
    const [organizedGames, setOrganizedGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancellingGameId, setCancellingGameId] = useState<string | null>(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [gameToCancel, setGameToCancel] = useState<Game | null>(null);
    const [processingRequest, setProcessingRequest] = useState<string | null>(null);
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        const fetchOrganizerGames = async () => {
            if (!session?.user?.id) {
                // Redirect to sign in if not authenticated
                console.log(session)
                router.push('/signin');
                return;
            }
            try {
                const response = await fetch('/api/organizer/games');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData?.message || 'Failed to fetch organized games');
                }
                const data = await response.json();
                setOrganizedGames(data);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchOrganizerGames();
        } else if (status === 'unauthenticated') {
            router.push('/signin');
        }
    }, [status, router]);

    const fetchUnreadCount = useCallback(async () => {
        // This is a self-contained fetch function for ManageGamesPage
        if (session?.user?.id) {
            try {
                await fetch('/api/notifications/count');
                // We don't need to update local state here, the Header will do it on its next interval/render
                console.log("Unread count re-fetched from ManageGamesPage");
            } catch (error) {
                console.error('Error re-fetching unread count:', error);
            }
        }
    }, [session?.user?.id]);

    const handleCancelClick = (game: Game) => {
        setGameToCancel(game);
        setShowConfirmationModal(true);
    };

    const confirmCancel = async () => {
        if (!gameToCancel?._id) return;

        setCancellingGameId(gameToCancel._id);
        setShowConfirmationModal(false);
        setError(null);

        try {
            const response = await fetch(`/api/games/${gameToCancel._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || 'Failed to cancel game');
            }

            // Update the UI: Filter out the cancelled game
            setOrganizedGames(prevGames => prevGames.filter(g => g._id !== gameToCancel._id));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCancellingGameId(null);
            setGameToCancel(null);
        }
    };

    const cancelConfirmation = () => {
        setShowConfirmationModal(false);
        setGameToCancel(null);
    };

    const fetchNotifications = useCallback(async () => {
        if (!session?.user?.id) {
            return;
        }
        try {
            const response = await fetch('/api/notifications');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || 'Failed to fetch notifications');
            }
        } catch (err: any) {
            console.error('Error fetching notifications:', err);
        }
    }, [session?.user?.id]);

    const handleAcceptRequest = async (gameId: string, userId: string) => {
        setProcessingRequest(`accept-${gameId}-${userId}`);
        setError(null);

        try {
            const response = await fetch(`/api/games/${gameId}/requests/${userId}/approve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || 'Failed to approve join request');
            }

            // Update the local state
            setOrganizedGames(prevGames =>
                prevGames.map(game => {
                    if (game._id === gameId) {
                        const updatedJoinRequests = game.joinRequests.filter(req => req._id !== userId);
                        const acceptedUser = game.joinRequests.find(req => req._id === userId);
                        return {
                            ...game,
                            joinRequests: updatedJoinRequests,
                            currentPlayers: acceptedUser ? [...game.currentPlayers, acceptedUser] : game.currentPlayers,
                        };
                    }
                    return game;
                })
            );
            setProcessingRequest(null);
            fetchNotifications();
            fetchUnreadCount();
        } catch (err: any) {
            setError(err.message);
            setProcessingRequest(null);
        }
    };

    const handleRejectRequest = async (gameId: string, userId: string) => {
        setProcessingRequest(`reject-${gameId}-${userId}`);
        setError(null);

        try {
            const response = await fetch(`/api/games/${gameId}/requests/${userId}/decline`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || 'Failed to decline join request');
            }

            // Update the local state
            setOrganizedGames(prevGames =>
                prevGames.map(game => {
                    if (game._id === gameId) {
                        return {
                            ...game,
                            joinRequests: game.joinRequests.filter(req => req._id !== userId),
                        };
                    }
                    return game;
                })
            );
            fetchNotifications();
            fetchUnreadCount();
            setProcessingRequest(null);
        } catch (err: any) {
            setError(err.message);
            setProcessingRequest(null);
        }
    };

    if (loading) {
        return <div>Loading your games...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    if (!organizedGames || organizedGames.length === 0) {
        return <p>You haven't organized any games yet.</p>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">Manage Your Games</h1>
            <ul className="space-y-4">
                {organizedGames.map((game) => (
                    <li key={game._id} className="bg-white shadow rounded-md p-4 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">{game.title}</h2>
                            <p className="text-gray-600">at {game.venue?.name}</p>
                            <p className="text-sm text-gray-500">{new Date(game.dateTime).toLocaleString()}</p>
                            <p className="text-gray-600">{game.status}</p>
                        </div>
                        <div className="flex space-x-2">
                            <Link href={`/organizer/games/${game._id}/edit`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Edit
                            </Link>
                            <button
                                onClick={() => handleCancelClick(game)}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                disabled={cancellingGameId === game._id}
                            >
                                {cancellingGameId === game._id ? 'Cancelling...' : 'Cancel'}
                            </button>
                        </div>

                        {game.joinRequests && game.joinRequests.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-2">Pending Join Requests:</h3>
                                <ul>
                                    {game.joinRequests.map((request) => (
                                    <li key={request._id} className="flex items-center justify-between py-2">
                                        <span>{request.name}</span>
                                        <div>
                                            {game._id && request._id && (
                                                <>
                                                    <button
                                                    onClick={() => handleAcceptRequest(game._id, request._id!)}
                                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
                                                    disabled={processingRequest === `accept-${game._id}-${request._id}`}
                                                >
                                                    {processingRequest === `accept-${game._id}-${request._id}` ? 'Accepting...' : 'Accept'}
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(game._id, request._id!)}
                                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                                                    disabled={processingRequest === `reject-${game._id}-${request._id}`}
                                                >
                                                    {processingRequest === `reject-${game._id}-${request._id}` ? 'Rejecting...' : 'Reject'}
                                                </button>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {game.joinRequests && game.joinRequests.length === 0 && (
                            <div className="mt-2 text-gray-600 border-t pt-2">
                                No pending join requests for this game.
                            </div>
                        )}
                    </li>
                ))}
            </ul>
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirmationModal}
                title="Confirm Cancellation"
                message={`Are you sure you want to cancel the game: "${gameToCancel?.title}"?`}
                onConfirm={confirmCancel}
                onCancel={cancelConfirmation}
                confirmButtonText="Yes, cancel"
                cancelButtonText="No, go back"
            />
        </div>
    );
};

export default ManageGamesPage;