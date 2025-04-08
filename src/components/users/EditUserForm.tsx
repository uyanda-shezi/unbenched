'use client';

import { User } from "@/types/User";
import React, { useState, useEffect } from 'react';

interface EditUserFormProps {
    user: User;
    onUserUpdated: (updatedUser: User) => void;
    onFormClose: () => void;
    setEditError: React.Dispatch<React.SetStateAction<string | null>>;
    setEditSuccess: React.Dispatch<React.SetStateAction<string | null>>;
}

const EditUserForm: React.FC<EditUserFormProps> = ({
    user,
    onUserUpdated,
    onFormClose,
    setEditError,
    setEditSuccess,
}) => {
    const [name, setName] = useState(user.name || '');
    const [email, setEmail] = useState(user.email);
    const [role, setRole] = useState(user.role);
    const [emailError, setEmailError] = useState<string | null>(null);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (!validateEmail(e.target.value)) {
            setEmailError('Please enter a valid email address.');
        } else {
            setEmailError(null);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditError(null);
        setEditSuccess(null);
        setEmailError(null);

        let isValid = true;

        if (!email) {
            setEmailError('Email is required.');
            isValid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address.');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, role }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || 'Failed to update user');
            }

            const updatedUser: User = await response.json();
            onUserUpdated(updatedUser);
            setEditSuccess('User updated successfully!');
            onFormClose();
        } catch (err: any) {
            setEditError(err.message);
        }
    };

    return (
        <div className="mt-6 border border-gray-300 rounded-md p-4">
            <h2 className="text-lg font-semibold mb-2">Edit User</h2>
            <form onSubmit={handleUpdateUser} className="grid grid-cols-1 gap-4">
                <div>
                    <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                    {emailError && <p className="text-red-500 text-xs italic">{emailError}</p>}
                </div>
                <div>
                    <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={onFormClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditUserForm;