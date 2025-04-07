import EditVenue from "@/components/venue/EditVenue";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Edit venue',
    description: 'Edit venue details',
};

export default function EditVenuePage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Edit venue</h1>
            <EditVenue/>
        </div>
    );
}