'use client';

import { User } from "@/types/User";
import React, { useState, useEffect } from 'react';
import CreateUserForm from "./CreateUserForm";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import EditUserForm from "./EditUserForm";

const UserManagementPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [editError, setEditError] = useState<string | null>(null);
    const [editSuccess, setEditSuccess] = useState<string | null>(null);

    const toggleCreateForm = () => {
            setShowCreateForm(!showCreateForm);
        };

    
        useEffect(() => {
            const fetchUsers = async () => {
                try {
                    const response = await fetch('/api/admin/users');
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData?.message || 'Failed to fetch users');
                    }
                    const data = await response.json();
                    setUsers(data);
                    setLoading(false);
                } catch (err: any) {
                    setError(err.message);
                    setLoading(false);
                }
            };
    
            fetchUsers();
        }, []);

        const handleDeleteClick = (userId: string) => {
            setUserToDelete(userId);
            setShowDeleteConfirmation(true);
            setDeleteError(null);
            setDeleteSuccess(null);
        };
    
        const handleUserDeleted = (deletedUserId: string) => {
            setUsers(users.filter(user => user._id !== deletedUserId));
            setShowDeleteConfirmation(false);
            setUserToDelete(null);
        };
    
        const handleCancelDelete = () => {
            setShowDeleteConfirmation(false);
            setUserToDelete(null);
            setDeleteError(null);
            setDeleteSuccess(null);
        };

        const handleEditClick = (user: User) => {
            setUserToEdit(user);
            setShowEditForm(true);
            setEditError(null);
            setEditSuccess(null);
        };
    
        const handleEditFormClose = () => {
            setShowEditForm(false);
            setUserToEdit(null);
            setEditError(null);
            setEditSuccess(null);
        };
    
        const handleUserUpdated = (updatedUser: User) => {
            setUsers(users.map(user => (user._id === updatedUser._id ? updatedUser : user)));
            setShowEditForm(false);
            setUserToEdit(null);
            setEditSuccess('User updated successfully!');
        };
    
        if (loading) {
            return <div>Loading users...</div>;
        }
    
        if (error) {
            return <div className="text-red-500">Error: {error}</div>;
        }
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">Admin: Manage Users</h1>
            <button onClick={toggleCreateForm} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
                {showCreateForm ? 'Hide Create New User Form' : 'Create New User'}
            </button>

            {loading && <div>Loading users...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {deleteSuccess && <div className="text-green-500 mb-2">{deleteSuccess}</div>}
            {deleteError && <div className="text-red-500 mb-2">{deleteError}</div>}
            {editSuccess && <div className="text-green-500 mb-2">{editSuccess}</div>}
            {editError && <div className="text-red-500 mb-2">{editError}</div>}

            {users.length > 0 ? (
                <ul className="bg-white shadow-md rounded-md p-4">
                    {users.map((user) => (
                        <li key={user._id} className="py-2 border-b border-gray-200 last:border-b-0 flex items-center justify-between">
                            <div>
                                <strong className="font-semibold">{user.name || 'No Name'}</strong>
                                <p className="text-gray-600 text-sm">{user.email}</p>
                                <p className="text-gray-500 text-xs">Role: {user.role}</p>
                                <p className="text-gray-500 text-xs">Created At: {new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                {/* Buttons for Edit and Delete will go here later */}
                                <button onClick={() => handleEditClick(user)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs mr-2">Edit</button>
                                <button onClick={() => handleDeleteClick(user._id as string)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs">Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="bg-white shadow-md rounded-md p-4 text-gray-700">No users found.</div>
            )}

            {showCreateForm && (
                            <CreateUserForm onUserAdded={(newUser) => setUsers([...users, newUser])} onFormClose={toggleCreateForm}/>
                        )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmation && userToDelete && (
                <ConfirmDeleteModal
                    userToDelete={userToDelete}
                    onDeleteConfirmed={handleUserDeleted}
                    onCancel={handleCancelDelete}
                    setDeleteError={setDeleteError}
                    setDeleteSuccess={setDeleteSuccess}
                />
            )}

            {/* Edit User Form */}
            {showEditForm && userToEdit && (
                <EditUserForm
                    user={userToEdit}
                    onUserUpdated={handleUserUpdated}
                    onFormClose={handleEditFormClose}
                    setEditError={setEditError}
                    setEditSuccess={setEditSuccess}
                />
            )}
        </div>
    )
}

export default UserManagementPage;