import React, { useState, useEffect } from 'react';
import { Game } from '@/types/Game';
import { Venue } from '@/types/Venue'; // Assuming you have these types
import { Court } from '@/types/Court';

interface EditGameFormProps {
    game: Game;
    setGame: React.Dispatch<React.SetStateAction<Game | null>>;
    onSubmit: (e: React.FormEvent) => void;
}

const EditGameForm: React.FC<EditGameFormProps> = ({ game, setGame, onSubmit }) => {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loadingVenues, setLoadingVenues] = useState(true);
    const [errorVenues, setErrorVenues] = useState<string | null>(null);
    const [selectedVenueCourts, setSelectedVenueCourts] = useState<Court[]>([]);
    const [dateTime, setDateTime] = useState('');

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await fetch('/api/venues');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData?.message || 'Failed to fetch venues');
                }
                const data = await response.json();
                setVenues(data);
                setLoadingVenues(false);
            } catch (err: any) {
                setErrorVenues(err.message);
                setLoadingVenues(false);
            }
        };

        fetchVenues();
    }, []);

    useEffect(() => {
        // Update available courts when the selected venue changes
        if (game?.venue?._id) {
            const selectedVenue = venues.find((v) => v._id === game.venue._id);
            setSelectedVenueCourts(selectedVenue?.courts || []);
        } else {
            setSelectedVenueCourts([]);
        }
    }, [game?.venue?._id, venues]);

    const handleVenueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedVenueId = event.target.value;
        const selectedVenue = venues.find((v) => v._id === selectedVenueId);
        setGame({ ...game, venue: selectedVenue, court: null } as any); // Reset court when venue changes
    };

    const handleCourtChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCourtId = event.target.value;
        const selectedCourt = selectedVenueCourts.find((c) => c._id === selectedCourtId);
        setGame({ ...game, court: selectedCourt } as any); // Assuming you want to store the whole court object in game.court
    };

    const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateTime(e.target.value);
        // Update the game state as well, if needed immediately
        // setGame(prevGame => ({ ...prevGame, dateTime: e.target.value } as any));
    };

    if (loadingVenues) {
        return <div>Loading venues...</div>;
    }

    if (errorVenues) {
        return <div className="text-red-500">Error loading venues.</div>;
    }

    return (
        <div className="bg-white shadow rounded-md p-6">
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
                    <input
                        type="text"
                        id="title"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={game.title || ''}
                        onChange={(e) => setGame({ ...game, title: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="dateTime" className="block text-gray-700 text-sm font-bold mb-2">Start Date and Time:</label>
                    <input
                        type="datetime-local"
                        id="dateTime"
                        value={dateTime} onChange={handleDateTimeChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Select the date and time the game will start.</p>
                </div>

                <div>
                    <label htmlFor="venue" className="block text-gray-700 text-sm font-bold mb-2">Venue:</label>
                    <select
                        id="venue"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={game.venue?._id || ''}
                        onChange={handleVenueChange}
                        required
                    >
                        <option value="">Select a Venue</option>
                        {venues.map((venue) => (
                            <option key={venue._id} value={venue._id}>
                                {venue.name}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Select the venue where the game will be played.</p>
                </div>

                {selectedVenueCourts && selectedVenueCourts.length > 0 && (
                    <div>
                        <label htmlFor="court" className="block text-gray-700 text-sm font-bold mb-2">Court:</label>
                        <select
                            id="court"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={game.court?._id || ''}
                            onChange={handleCourtChange}
                            required
                        >
                            <option value="">Select a Court</option>
                            {selectedVenueCourts.map((court) => (
                                <option key={court._id} value={court._id}>
                                    {court.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Select the specific court at the venue.</p>
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditGameForm;