import { Document, Types } from "mongoose";
import { User } from "./User";
import { Venue } from "./Venue";

export interface Game{
        _id: string;
        title: string;
        description: string;
        venue: Venue;
        dateTime: Date;
        organizer: User;
        maxPlayers: number;
        currentPlayers: User[];
        joinRequests: User[];
        price: number;
        startDateTime: Date;
        duration: number
        createdAt: Date;
        updatedAt: Date;
}