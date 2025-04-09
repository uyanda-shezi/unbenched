'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Game } from '@/types/Game';
import { useSession } from 'next-auth/react';

const GameDetailPage = () => {
    const [game, setGame] = useState<Game | null>(null);
    const [loadingGame, setLoadingGame] = useState(true);
    const [errorGame, setErrorGame] = useState<string | null>(null);
    const { id } = useParams();
    const { data: session, status: sessionStatus } = useSession();
    const [requestSent, setRequestSent] = useState(false);
    const [joiningLoading, setJoiningLoading] = useState(false);
    const [joiningError, setJoiningError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGameDetails = async () => {
            if (!id) return;
            try {
                const response = await fetch(`/api/games/${id}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData?.message || 'Failed to fetch game details');
                }
                const data = await response.json();
                setGame(data);
                setLoadingGame(false);
            } catch (err: any) {
                setErrorGame(err.message);
                setLoadingGame(false);
            }
        };

        fetchGameDetails();
    }, [id]);

    const handleRequestJoin = async () => {
        if (sessionStatus === 'unauthenticated') {
            alert('You must be signed in to request to join.');
            return;
        }

        if (!session?.user?.id || !game?._id) return;

        setJoiningLoading(true);
        setJoiningError(null);

        try {
            console.log(game._id);
            const response = await fetch(`/api/games/${game._id}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: session.user.id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || 'Failed to request to join');
            }

            setRequestSent(true);
            alert('Your request to join has been sent.');
            // Optionally, update the game state to reflect the request
        } catch (err: any) {
            setJoiningError(err.message);
        } finally {
            setJoiningLoading(false);
        }
    };

    if (loadingGame) {
        return <div>Loading game details...</div>;
    }

    if (errorGame) {
        return <div className="text-red-500">Error: {errorGame}</div>;
    }

    if (!game) {
        return <div>Game not found.</div>;
    }

    const canRequestToJoin = session?.user?.id &&
        !game.currentPlayers?.some((player: any) => player._id === session?.user?.id) &&
        !game.joinRequests?.some((request: any) => request._id === session?.user?.id);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">{game.title}</h1>
            <p className="mb-2"><strong>Description:</strong> {game.description}</p>
            <p className="mb-2"><strong>Venue:</strong> {game.venue?.name}, {game.venue?.address}</p>
            <p className="mb-2"><strong>Date and Time:</strong> {new Date(game.dateTime).toLocaleString()}</p>
            <p className="mb-2"><strong>Organizer:</strong> {game.organizer?.name}</p>
            <p className="mb-2"><strong>Court:</strong> {game?.court?.name}</p>
            <p className="mb-2"><strong>Players:</strong> {game.currentPlayers?.length}/{game.maxPlayers}</p>
            {game.currentPlayers?.length > 0 && (
                <div className="mb-2">
                    <strong>Current Players:</strong>
                    <ul>
                        {game.currentPlayers.map((player: any) => (
                            <li key={player._id}>{player.name}</li>
                        ))}
                    </ul>
                </div>
            )}
            <p className="mb-2"><strong>Price:</strong> {game.price > 0 ? `R${game.price.toFixed(2)}` : 'Free'}</p>

            {sessionStatus === 'loading' ? (
                <p className="mt-4 text-gray-600">Checking authentication...</p>
            ) : sessionStatus === 'unauthenticated' ? (
                <p className="mt-4 text-gray-600">Sign in to request to join this game.</p>
            ) : (
                canRequestToJoin ? (
                    <button
                        onClick={handleRequestJoin}
                        disabled={requestSent || joiningLoading}
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 ${requestSent || joiningLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {joiningLoading ? 'Sending Request...' : requestSent ? 'Request Sent' : 'Request to Join'}
                    </button>
                ) : (
                    <p className="mt-4 text-gray-600">
                        {game.currentPlayers?.some((player: any) => player._id === session?.user?.id)
                            ? 'You are already in this game.'
                            : game.joinRequests?.some((request: any) => request._id === session?.user?.id)
                                ? 'You have already requested to join this game.'
                                : 'You cannot join this game.'}
                    </p>
                )
            )}
            {joiningError && <p className="mt-2 text-red-500">{joiningError}</p>}
        </div>
    );
};

export default GameDetailPage;