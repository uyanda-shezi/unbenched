'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Venue } from '@/types/Venue';
import { ParamValue } from 'next/dist/server/request/params';
import { Court } from '@/types/Court';

interface EditVenueFormProps {
    id: ParamValue,
    venue: Venue,
}

const EditVenueForm: React.FC<EditVenueFormProps> = ({id, venue}) => {
    const [name, setName] = useState(venue.name);
    const [address, setAddress] = useState(venue.address);
    const [latitude, setLatitude] = useState<number | ''>(venue.latitude);
    const [longitude, setLongitude] = useState<number | ''>(venue.longitude);
    const [currentCourtName, setCurrentCourtName] = useState('');
    const [courtNamesList, setCourtNamesList] = useState<Court[]>(venue.courts); // Initialize with existing courts
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const handleAddCourt = () => {
        if (currentCourtName.trim() !== '') {
            setCourtNamesList([...courtNamesList, { _id: '', name: currentCourtName.trim() }]); // New courts don't have IDs yet
            setCurrentCourtName('');
        }
    };

    const handleRemoveCourt = (indexToRemove: number) => {
        setCourtNamesList(courtNamesList.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionError(null);

        if (!name || !address || latitude === '' || longitude === '' || isNaN(Number(latitude)) || isNaN(Number(longitude)) || courtNamesList.length === 0) {
            setSubmissionError('Please fill in all fields and provide at least one court name.');
            return;
        }

        const updatedVenueData = {
            name,
            address,
            latitude: Number(latitude),
            longitude: Number(longitude),
            courts: courtNamesList.map(court => ({ _id: court._id || undefined, name: court.name })), // Include IDs for existing courts
        };

        try {
            const response = await fetch(`/api/admin/venues/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedVenueData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || 'Failed to update venue');
            }

            // Handle successful update (e.g., redirect or show a message)
            console.log('Venue updated successfully!');
        } catch (err: any) {
            setSubmissionError(err.message);
        }
    };

    return (
        <div className="container mx-auto p-4">

            {submissionError && <p className="text-red-500 mb-2">{submissionError}</p>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                <div>
                    <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div>
                    <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Address:</label>
                    <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div>
                    <label htmlFor="latitude" className="block text-gray-700 text-sm font-bold mb-2">Latitude:</label>
                    <input
                        type="number"
                        id="latitude"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div>
                    <label htmlFor="longitude" className="block text-gray-700 text-sm font-bold mb-2">Longitude:</label>
                    <input
                        type="number"
                        id="longitude"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div>
                    <label htmlFor="currentCourtName" className="block text-gray-700 text-sm font-bold mb-2">Add New Court:</label>
                    <div className="flex items-center">
                        <input
                            type="text"
                            id="currentCourtName"
                            value={currentCourtName}
                            onChange={(e) => setCurrentCourtName(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                        />
                        <button
                            type="button"
                            onClick={handleAddCourt}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Add Court
                        </button>
                    </div>
                </div>

                {courtNamesList.length > 0 && (
                    <div className="mt-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Courts:</label>
                        <ul className="list-disc pl-5">
                            {courtNamesList.map((court, index) => (
                                <li key={court._id || `new-${index}`} className="flex items-center justify-between py-2">
                                    <span>{court.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCourt(index)}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs focus:outline-none focus:shadow-outline"
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex justify-end">
                    <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Save Changes</button>
                    {/* Optionally add a Cancel button */}
                </div>
            </form>
        </div>
    );
}
export default EditVenueForm;