import { Metadata } from "next";
import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/db";
import Game from "@/models/Game";
import { ObjectId } from 'mongodb';
import { isValidObjectId } from 'mongoose';

interface GameDetailPageProps {
    params: {
        id: string;
    }
}

interface GameOrganizer {
    _id: string;
    name: string;
    email?: string;
}

interface GamePlayer {
    _id: string;
    name: string;
}

interface GameData {
    _id: string;
    title: string;
    description: string;
    location: {
        address: string;
    };
    dateTime: string;
    skillLevel: string;
    price: number;
    maxPlayers: number;
    organizer: GameOrganizer;
    currentPlayers: GamePlayer[];
}

async function getGameData(id: string, fullDetails: boolean = false){
    // Check if ID is valid before attempting to query
    if (!isValidObjectId(id)) {
        console.log(`Invalid ObjectId format: ${id}`);
        return null;
    }

    await connectToDatabase();

    try {
        const populateOptions = fullDetails ? [
            {path: 'organizer', select: 'name email'},
            {path: 'currentPlayers', select: 'name'},
        ] : [{path: 'organizer', select: 'name'}];

        const game = await Game.findById(id).populate(populateOptions);
        return game;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error fetching games";
        console.error(errorMessage);
        return null;
    }
}

export async function generateMetadata({ params }: GameDetailPageProps): Promise<Metadata> {
    const game = await getGameData(params.id);
    if (!game) {
        return {title: 'Game not found'};
    };
    return {
        title: `${game.title} | Match Finder`,
        description: game.description,
    }
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
    const game = await getGameData(params.id, true);

    if (!game) {
        notFound();
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString( [], {hour: '2-digit', minute: '2-digit'} )
    };

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-4xl mx-auto bg-white rounded shadow-md p-6">
                <h1 className="text-3xl font-bold mb-2">{game.title}</h1>

                <div className="mb-6">
                    <p className="text-gray-600">Organized by: {game.organizer.name}</p>
                    <p className="text-gray-600">Location: {game.location.address}</p>
                    <p className="text-gray-600">When: {formatDate(game.dateTime)}</p>
                </div>

                <div className="bg-gray-100 p-4 rounded mb-6">
                    <h2 className="text-xl font-bold mb-2">About this game</h2>
                    <p>{game.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-100 p-4 rounded">
                        <h3 className="font-bold mb-1">Skill Level</h3>
                        <p className="capitalize">{game.skillLevel}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded">
                        <h3 className="font-bold mb-1">Price</h3>
                        <p>${game.price.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded">
                        <h3 className="font-bold mb-1">Players</h3>
                        <p>{game.currentPlayers.length}/{game.maxPlayers}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-2">Current Players</h2>
                    {game.currentPlayers.length > 0 ? (
                        <ul className="bg-gray-100 p-4 rounded">
                            {game.currentPlayers.map((player: GamePlayer) => (<li key={player._id}>{player.name}</li>))}
                        </ul>) : 
                        (<p className="bg-gray-100 p-4 rounded">No players have joined yet</p>)}
                </div>
                
                <div className="flex justify-center">
                    <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Request to Join</button>
                </div>
            </div>
        </div>
    );
}