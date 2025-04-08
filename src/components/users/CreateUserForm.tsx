'use client';

import { User } from "@/types/User";
import React, { useState, useEffect } from 'react';

interface AddNewUserFormProps {
    onUserAdded: (newUser: User) => void;
    onFormClose: () => void;
}

const CreateUserForm: React.FC<AddNewUserFormProps> = ({ onUserAdded, onFormClose }) => {
        const [name, setNewName] = useState('');
        const [email, setNewEmail] = useState('');
        const [password, setNewPassword] = useState('');
        const [role, setNewRole] = useState('user');
        const [creationError, setCreationError] = useState<string | null>(null);
        const [creationSuccess, setCreationSuccess] = useState<string | null>(null);

        const handleCreateUser = async (e: React.FormEvent) => {
            e.preventDefault();
            setCreationError(null);
            setCreationSuccess(null);
        
            if (!name || !email || !role) {
                setCreationError('Please fill in all fields.');
                return;
            }
        
            try {
                const response = await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, password, role }),
                });
        
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData?.message || 'Failed to create user');
                }
        
                const newUser: User = await response.json(); // Expecting the user data directly
                onUserAdded(newUser);
                setCreationSuccess('User created successfully!');
                onFormClose();
                setNewName('');
                setNewEmail('');
                setNewPassword('');
                setNewRole('user');
            } catch (err: any) {
                setCreationError(err.message);
            }
        };

    return (
        <div className="mt-6 border border-gray-300 rounded-md p-4">
                    <h2 className="text-lg font-semibold mb-2">Create New User</h2>
                    {creationError && <p className="text-red-500 mb-2">{creationError}</p>}
                    {creationSuccess && <p className="text-green-500 mb-2">{creationSuccess}</p>}
                    <form onSubmit={handleCreateUser} className="grid grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                            <input type="text" id="name" value={name} onChange={(e) => setNewName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                            <input type="email" id="email" value={email} onChange={(e) => setNewEmail(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
                            <input type="password" id="password" value={password} onChange={(e) => setNewPassword(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
                            <select id="role" value={role} onChange={(e) => setNewRole(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">Create User</button>
                            <button type="button" onClick={onFormClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancel</button>
                        </div>
                    </form>
                </div>
    )
}

export default CreateUserForm;