import { Court } from "./Court";

export interface Venue {
    _id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    courts: Court[];
    createdAt: string;
    updatedAt: string;
}