'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Venue } from '@/types/Venue';
import EditVenueForm from './EditVenueForm';

const EditVenue = () => {
    const { id } = useParams();
    const router = useRouter();
    const [venue, setVenue] = useState<Venue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
    
        const fetchVenue = async () => {
            try {
                const response = await fetch(`/api/admin/venues/${id}`); // Corrected API endpoint
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData?.message || 'Failed to fetch venue details for editing');
                }
                const data = await response.json();
                setVenue(data);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };
    
        fetchVenue();
    }, [id]);

    if (loading) {
        return <div>Loading venue details...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!venue) {
        return <div>Venue not found.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">Edit Venue</h1>
            <p>Editing venue with ID: {id}</p>

            {venue && <EditVenueForm id={id} venue={venue} />}
        </div>
    );
};

export default EditVenue;