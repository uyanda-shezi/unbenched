'use client';

import React, { useState, useEffect } from 'react';
import { Venue } from '@/types/Venue';

interface AddNewVenueFormProps {
    onVenueAdded: (newVenue: Venue) => void;
    onFormClose: () => void;
}

const AddNewVenueForm: React.FC<AddNewVenueFormProps> = ({ onVenueAdded, onFormClose }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    // const [latitude, setLatitude] = useState<number | ''>('');
    // const [longitude, setLongitude] = useState<number | ''>('');
    const [courtNamesInput, setCourtNamesInput] = useState('');
    const [currentCourtName, setCurrentCourtName] = useState('');
    const [courtNamesList, setCourtNamesList] = useState<string[]>([]); // List of courts to be added
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const handleAddCourt = () => {
        if (currentCourtName.trim() !== '') {
            setCourtNamesList([...courtNamesList, currentCourtName.trim()]);
            setCurrentCourtName(''); // Clear the input field
        }
    };

    const handleRemoveCourt = (indexToRemove: number) => {
        setCourtNamesList(courtNamesList.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionError(null);

        if (!name || !address || courtNamesList.length === 0) {
            setSubmissionError('Please fill in all fields and provide at least one court name.');
            return;
        }

        try {
            const response = await fetch('/api/admin/venues', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, address, courtNamesList }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || 'Failed to create venue');
            }

            const data = await response.json();
            onVenueAdded(data.venue as Venue);
            onFormClose();
            setName('');
            setAddress('');
            setCourtNamesInput('');
        } catch (err: any) {
            setSubmissionError(err.message);
        }
    };

    return (
        <div className="mt-6 border border-gray-300 rounded-md p-4">
            <h3 className="text-lg font-semibold mb-2">Add New Venue</h3>
            {submissionError && <p className="text-red-500 mb-2">{submissionError}</p>}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                <div>
                    <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </div>
                <div>
                    <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Address:</label>
                    <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </div>
                <div>
                    <label htmlFor="currentCourtName" className="block text-gray-700 text-sm font-bold mb-2">Court Name:</label>
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
                        <label className="block text-gray-700 text-sm font-bold mb-2">Courts to Add:</label>
                        <ul className="list-disc pl-5">
                        {courtNamesList.map((courtName, index) => (
                                <li key={index} className="flex items-center justify-between py-2">
                                <span>{courtName}</span>
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
                    <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add Venue</button>
                    <button type="button" onClick={onFormClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default AddNewVenueForm;