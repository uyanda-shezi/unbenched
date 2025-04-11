'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Game } from '@/types/Game';
import Link from 'next/link';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

const ManageGamesPage = () => {
    const [organizedGames, setOrganizedGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancellingGameId, setCancellingGameId] = useState<string | null>(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [gameToCancel, setGameToCancel] = useState<Game | null>(null);
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
                            {/* Add other relevant game details here */}
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