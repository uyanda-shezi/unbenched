import { Court } from "./Court";

export interface Venue {
    _id: string;
    name: string;
    address: string;
    courts: Court[];
    createdAt: string;
    updatedAt: string;
}