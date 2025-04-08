'use client';

import React from 'react';
import { User } from "@/types/User";

interface ConfirmDeleteProps {
    userToDelete: string | null;
    onDeleteConfirmed: (deletedUserId: string) => void; // Callback for successful deletion
    onCancel: () => void; // Callback for cancellation
    setDeleteError: React.Dispatch<React.SetStateAction<string | null>>; // Function to set error in parent
    setDeleteSuccess: React.Dispatch<React.SetStateAction<string | null>>; // Function to set success in parent
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteProps> = ({
    userToDelete,
    onDeleteConfirmed,
    onCancel,
    setDeleteError,
    setDeleteSuccess,
}) => {
    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const response = await fetch(`/api/admin/users/${userToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || 'Failed to delete user');
            }

            setDeleteSuccess('User deleted successfully!');
            onDeleteConfirmed(userToDelete); // Notify parent of successful deletion
        } catch (err: any) {
            setDeleteError(err.message);
        }
    };

    const cancelDeleteUser = () => {
        onCancel(); // Notify parent of cancellation
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-md p-8 shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
                <p className="mb-4">Are you sure you want to delete this user?</p>
                <div className="flex justify-end space-x-2">
                    <button onClick={confirmDeleteUser} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Confirm Delete</button>
                    <button onClick={cancelDeleteUser} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;