import { User } from "./User";
import { Venue } from "./Venue";
import { Court } from "./Court";

export interface Game{
        _id: string;
        title: string;
        description: string;
        venue: Venue;
        court: Court;
        dateTime: Date;
        organizer: User;
        maxPlayers: number;
        currentPlayers: User[];
        joinRequests: User[];
        price: number;
        status: 'open' | 'closed' | 'cancelled' | 'completed';
        startDateTime: Date;
        duration: number
        createdAt: Date;
        updatedAt: Date;
}