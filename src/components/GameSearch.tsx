'use client';
import React, {useState} from "react";

interface GameSearchProps {
    //Props
}

const GameSearch: React.FC<GameSearchProps> = () => {
    const [location, setLocation] = useState('');

    const handleSearch = () => {
        console.log(`Searching games near ${location}`);
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Find Games</h2>
            <div className="flex">
                <input
                    type="text"
                    placeholder="Enter your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-grow p2 border rounded-l"/>
                    <button 
                        onClick={handleSearch}
                        className="bg-blue-500 text-white p-2 rounded-r">
                        Search
                    </button>
            </div>
        </div>
    );
};

export default GameSearch;