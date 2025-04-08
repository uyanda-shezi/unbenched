import { Metadata } from "next";
import GameCreateForm from "@/components/game/GameCreateForm";

export const metadata: Metadata = {
    title: 'Create match',
    description: 'Create new match and find players',
};

export default function CreateGamePage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Create match</h1>
            <GameCreateForm/>
        </div>
    );
}