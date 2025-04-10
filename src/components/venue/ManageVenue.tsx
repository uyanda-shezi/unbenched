'use client';

import React, { useState, useEffect } from 'react';
import AddNewVenueForm from './AddNewVenueForm';
import { Venue } from '@/types/Venue';
import Link from 'next/link';

const ManageVenuePageComponent = () =>{
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [venueToDelete, setVenueToDelete] = useState<string | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await fetch('/api/venues');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData?.message || 'Failed to fetch venues');
                }
                const data = await response.json();
                setVenues(data);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchVenues();
    }, []);

    const toggleAddForm = () => {
        setShowAddForm(!showAddForm);
    };

    const handleDeleteClick = (venueId: string) => {
        setVenueToDelete(venueId);
        setShowDeleteConfirmation(true);
    };

    const confirmDeleteVenue = async () => {
        if (!venueToDelete) return;

        try {
            const response = await fetch(`/api/admin/venues/${venueToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || 'Failed to delete venue');
            }

            // Remove the deleted venue from the local state
            setVenues(venues.filter(venue => venue._id !== venueToDelete));
            setShowDeleteConfirmation(false);
            setVenueToDelete(null);
            // Optionally, show a success message
        } catch (err: any) {
            setError(err.message);
            setShowDeleteConfirmation(false);
            setVenueToDelete(null);
            // Optionally, show an error message
        }
    };

    const cancelDeleteVenue = () => {
        setShowDeleteConfirmation(false);
        setVenueToDelete(null);
    };

    if (loading) {
        return <div>Loading venues...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Admin: Manage Venues</h1>
            <button onClick={toggleAddForm} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
                {showAddForm ? 'Hide Add New Venue Form' : 'Add New Venue'}
            </button>

            {loading && <div>Loading venues...</div>}
            {error && <div className="text-red-500">{error}</div>}

            {venues.length > 0 && (
                <ul className="bg-white shadow-md rounded-md p-4">
                    {venues.map((venue) => (
                        <li key={venue._id} className="py-2 border-b border-gray-200 last:border-b-0 flex items-center justify-between">
                            <div>
                                <strong className="font-semibold">{venue.name}</strong>
                                <p className="text-gray-600 text-sm">{venue.address}</p>
                                <p className="text-gray-500 text-xs">Courts: {
                                    venue.courts.map((court) => court.name).join(', ')
                                }</p>
                            </div>
                            <div className="space-x-2">
                                <Link href={`/admin/venues/${venue._id}/edit`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs">
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDeleteClick(venue._id)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {venues.length === 0 && !loading && <div className="bg-white shadow-md rounded-md p-4 text-gray-700">No venues found.</div>}

            {showAddForm && (
                <AddNewVenueForm onVenueAdded={(newVenue) => setVenues([...venues, newVenue])} onFormClose={toggleAddForm} />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmation && (
                <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-md p-8 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
                        <p className="mb-4">Are you sure you want to delete this venue?</p>
                        <div className="flex justify-end space-x-2">
                            <button onClick={confirmDeleteVenue} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Confirm Delete</button>
                            <button onClick={cancelDeleteVenue} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};



export default ManageVenuePageComponent;