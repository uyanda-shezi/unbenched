import { Metadata } from "next";
import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/db";
import Game from "@/models/Game";

interface GameDetailPageProps {
    params: {
        id: string;
    }
}

export async function generateMetaData({ params }: GameDetailPageProps): Promise<Metadata> {
    await connectToDatabase();

    try {
        const game = await Game.findById(params.id).populate('organizer', 'name');
        
        if (!game) {
            return {
                title: 'Game not found'
            }
        }

        return {
            title: `${game.title} | Match Finder`,
            description: game.description,
        };
    } catch (error) {
        return {
            title: 'Game Details',
        };
    }
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
    await connectToDatabase();

    try {
        const game = await Game.findById(params.id).populate('organizer', 'name email')
                                                    .populate('currentPlayers', 'name');
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
                        <p className="text-gray-600">Oganized by: {game.organizer.name}</p>
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
                                {game.currentPlayers.map((player: any) => (<li key={player._id}>{player.name}</li>))}
                            </ul>) : 
                            (<p className="bg-gray-100 p-4 rounded">No players have joined yet</p>)}
                    </div>
                    
                    <div className="flex justify-center">
                        <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Request to Join</button>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error fetching game:', error);
        notFound()
    }
}