'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Game } from '@/types/Game';
import Link from 'next/link';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import GameNotFound from '@/components/ui/GameNotFound';
import EditGameForm from '@/components/organizer/EditGameForm';

const EditGamePage = () => {
    const { gameId } = useParams();
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        const fetchGameDetails = async () => {
            if (!session?.user?.id) {
                router.push('/signin');
                return;
            }
            if (!gameId) {
                setError('Game ID not provided.');
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`/api/games/${gameId}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData?.message || 'Failed to fetch game details');
                }
                const data = await response.json();
                setGame(data);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchGameDetails();
    }, [gameId, session?.user?.id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!game) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/games/${gameId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: game.title,
                    dateTime: game.dateTime,
                    venue: game.venue?._id,
                    court: game.court?._id,
                    // Add other fields you want to update here
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || 'Failed to update game');
            }

            setIsSubmitting(false);
            router.push('/organizer/manage-games'); // Redirect back to manage games page on success
        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">Edit Game</h1>
            <Link href="/organizer/manage-games" className="mb-4 inline-block text-blue-500 hover:underline">
                Back to Manage Games
            </Link>
            {loading && <LoadingState />}
            {error && <ErrorState error={error} />}
            {!loading && !error && !game && <GameNotFound />}
            {!loading && !error && game && (
                <EditGameForm game={game} setGame={setGame} onSubmit={handleSubmit} />
            )}
            {isSubmitting && <div>Saving changes...</div>}
        </div>
    );
};

export default EditGamePage;