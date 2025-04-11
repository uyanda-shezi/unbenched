'use client';

import React, { useState, useEffect } from 'react';
import { Venue } from '@/types/Venue';
import { Court } from '@/types/Court';
import { useSession } from 'next-auth/react';

interface CreateGameModalProps {
    onClose: () => void;
    onGameCreated: (newGame: any) => void; // Type 'any' for now, refine later
}

const CreateGameModal: React.FC<CreateGameModalProps> = ({ onClose, onGameCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [maxPlayers, setMaxPlayers] = useState<number | ''>(10);
    const [price, setPrice] = useState<number | ''>(0);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [selectedVenueId, setSelectedVenueId] = useState<string>('');
    const [courts, setCourts] = useState<Court[]>([]);
    const [selectedCourtId, setSelectedCourtId] = useState<string>('');
    const [duration, setDuration] = useState<number | ''>(60);
    const [error, setError] = useState<string | null>(null);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await fetch('/api/venues'); // Assuming you have an endpoint to fetch venues
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData?.message || 'Failed to fetch venues');
                }
                const data = await response.json();
                setVenues(data);
            } catch (err: any) {
                setError(err.message);
            }
        };

        fetchVenues();
    }, []);

    useEffect(() => {
        const fetchVenueDetails = async (venueId: string) => {
            if (venueId) {
                try {
                    const response = await fetch(`/api/venues/${venueId}`);
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData?.message || 'Failed to fetch venue details');
                    }
                    const data: Venue = await response.json(); // Type the response as Venue
                    setCourts(data.courts || []);
                } catch (err: any) {
                    setError(err.message);
                    setCourts([]);
                }
            } else {
                setCourts([]);
            }
        };

        fetchVenueDetails(selectedVenueId);
        setSelectedCourtId(''); // Reset selected court when venue changes
    }, [selectedVenueId]);

    const handleVenueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        setSelectedVenueId(newValue);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!session?.user?.id) {
            setError('You must be signed in to create a game.');
            return;
        }

        try {
            const response = await fetch('/api/games/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    selectedVenueId,
                    selectedCourtId,
                    dateTime,
                    maxPlayers: Number(maxPlayers),
                    price: Number(price),
                    organizerId: session.user.id, // Send the organizer's ID
                    duration: Number(duration),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || 'Failed to create game');
            }

            const newGame = await response.json();
            onGameCreated(newGame);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-8 rounded-md shadow-md w-96">
                <h2 className="text-lg font-semibold mb-4">Create New Game</h2>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
                        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div>
                        <label htmlFor="venue" className="block text-gray-700 text-sm font-bold mb-2">Venue:</label>
                        <select id="venue" value={selectedVenueId} onChange={handleVenueChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                            <option value="">Select a venue</option>
                            {venues.map((v) => (
                                <option key={v._id} value={v._id}>{v.name}</option>
                            ))}
                        </select>
                    </div>

                    {courts.length > 0 && (
                        <div>
                            <label htmlFor="court" className="block text-gray-700 text-sm font-bold mb-2">Court:</label>
                            <select id="court" value={selectedCourtId} onChange={(e) => setSelectedCourtId(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                                <option value="">Select a court</option>
                                {courts.map((court) => (
                                    <option key={court._id} value={court._id}>{court.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label htmlFor="dateTime" className="block text-gray-700 text-sm font-bold mb-2">Date and Time:</label>
                        <input type="datetime-local" id="dateTime" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div>
                        <label htmlFor="duration" className="block text-gray-700 text-sm font-bold mb-2">Duration (minutes):</label>
                        <input
                            type="number"
                            id="duration"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value === '' ? '' : parseInt(e.target.value))}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            min="1"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="maxPlayers" className="block text-gray-700 text-sm font-bold mb-2">Max Players:</label>
                        <input type="number" id="maxPlayers" value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value === '' ? '' : parseInt(e.target.value))} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" min="1" />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">Price:</label>
                        <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" min="0" step="0.01" />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">Create Game</button>
                        <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateGameModal;