'use client';

import { Game } from '@/types/Game';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import CreateGameModal from '@/components/game/CreateGameModal';
import Link from 'next/link';

const GamesPage = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateGameModal, setShowCreateGameModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { data: session } = useSession(); // Get the session

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await fetch('/api/games'); // We'll create this API endpoint
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData?.message || 'Failed to fetch games');
                }
                const data = await response.json();
                setGames(data);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    if (loading) {
        return <div>Loading available games...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    const handleCreateGameClick = () => {
        if (session?.user) {
            setShowCreateGameModal(true);
        } else {
            alert('You must be signed in to create a game.'); // Basic authentication check
            // You might want to redirect to the sign-in page instead of an alert
        }
    };

    const handleCreateGameModalClose = () => {
        setShowCreateGameModal(false);
    };

    const handleGameCreated = (newGame: Game) => {
        setGames([...games, newGame]);
        setShowCreateGameModal(false);
        setSuccessMessage('Game created successfully!'); // Set success message
        setTimeout(() => {
            setSuccessMessage(null); // Clear message after a delay
        }, 3000); // 3 seconds
    };

    return (
        <div className="container mx-auto p-4 relative">
            <h1 className="text-2xl font-semibold mb-4">Available Games</h1>
            <button
                onClick={handleCreateGameClick}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
                Create New Game
            </button>

            {successMessage && (
                <div className="bg-green-200 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline ml-2">{successMessage}</span>
                </div>
            )}

            {games.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {games.map((game) => (
                        <li key={game._id} className="bg-white shadow-md rounded-md p-4">
                                <Link href={`/games/${game._id}`} className="block hover:bg-gray-100 p-2 rounded">
                                <h2 className="font-semibold">{game.title}</h2>
                                <p className="text-gray-600">{game.venue?.name}</p>
                                <p className="text-sm text-gray-500">{new Date(game.dateTime).toLocaleString()}</p>
                                {/* You can display other relevant info here */}
                                <span className="inline-block bg-blue-100 text-blue-800 py-1 px-2 rounded-full text-xs font-semibold mt-2">
                                    {game.maxPlayers - (game.currentPlayers?.length || 0)} spots open
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="bg-white shadow-md rounded-md p-4 text-gray-700">No games available at the moment.</div>
            )}

            {showCreateGameModal && session?.user && (
                <CreateGameModal
                    onClose={handleCreateGameModalClose}
                    onGameCreated={handleGameCreated}
                />
            )}
        </div>
    );
};

export default GamesPage;