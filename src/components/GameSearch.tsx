'use client';
import React, {useState, useEffect} from "react";
import { useRouter } from "next/navigation";

interface Game {
    //Props
    _id: string;
    title: string;
    location: {
        coordinates: [number, number],
        address: string;
    };
    dateTime: string;
    skillLevel: string;
    maxPlayers: number;
    currentPlayers: any[];
    price: number;
}

const GameSearch = () => {
    const router = useRouter();
    const [location, setLocation] = useState('');
    const [radius, setRadius] = useState(10);
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(false);
    const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);

    useEffect( () => {
        // Try get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        try {
            let queryParams = '';

            if (userCoords) {
                queryParams = `?lat=${userCoords.lat}&lng=${userCoords.lng}&radius=${radius * 1000}`;
            }

            const response = await fetch(`/api/games${queryParams}`);

            if (!response.ok) {
                throw new Error('Failed to fetch games');
            }

            const data = await response.json();
            setGames(data);
        } catch (error) {
            console.error('Error searching games:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect( () => {
        if (userCoords) {
            handleSearch();
        }
    }, [userCoords]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
    };

    return ( 
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-4 shadow rounded mb-6">
                <h2 className="text-2xl font-bold mb-4">Find games</h2>

                <div className="flex items-end gap-4">
                    <div className="flex-grow">
                            <label className="block text-gray-700 mb-2">Your location</label>
                            <input 
                                type="text" 
                                placeholder="Enter your location"
                                value={location}
                                onChange={ (e) => setLocation(e.target.value) }
                                className="w-full p-2 border rounded"
                            />
                    </div>
                </div>

                <div className="w-32">
                        <label className="block text-gray-700 mb-2">Radius(km)</label>
                        <input
                            type="number"
                            value={radius}
                            onChange={ (e) => setRadius(parseInt(e.target.value)) }
                            min={1}
                            max={50}
                            className="w-full p-2 border rounded"
                        />
                </div>

                <button 
                    onClick={handleSearch} 
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                        Search
                </button>
            </div>

            { loading ? (<div className="text-center p-8">Loading games...</div> ) : 
                (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        { games.length > 0 ? (
                         games.map( (game) => ( 
                         <div key={game._id} className="bg-white p-4 shadow rounded">
                             <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                             <p className="text-gray-600 mb-2">{game.location.address}</p>
                             <p className="mb-2">
                                 <span className="font-semibold">When:</span> {formatDate(game.dateTime)}
                             </p>
                             <div className="flex justify-between item-center mb-2">
                                 <span className="capitalize">{game.skillLevel}</span>
                                 <span>${game.price.toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                 <span>{game.currentPlayers.length} / {game.maxPlayers} players</span>
                                 <button onClick={ () => router.push(`/games/${game._id}`)}
                                     className="bg-blue-500 text-white py-1 px-2 rounded text-sm hover:bg-blue-600">
                                         View Details
                                 </button>
                             </div>
                         </div>
                     ))
                 ) : ( <div className="col-span-2 text-center p-8">
                     No games found in your area. Try expanding your search radius.
                     </div>
                 )}
                    </div>
                )
            }
        </div>
    );
};

export default GameSearch;