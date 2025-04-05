'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RegistrationFormData, SkillLevel } from "@/types/User";

const RegistrationForm: React.FC = () => {
    const [formData, setFormData] = useState<RegistrationFormData>({
        name: '',
        email: '',
        skillLevel: SkillLevel.Beginner,
        password: '',
    });

    const[error, setError] = useState<string | null>(null);
    const[isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok){
                router.push(`/signin`);
            } else {
                const errorData = await response.json;
                setError(errorData?.message || 'Registration failed. Please try again.')
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error creating profile'
            console.error(errorMessage)
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-6 border rounded shadow-md">
            <h2 className="test-2xl font-semibold mb-4">Create an Account</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline">{error}</span>
                </div>}
            <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    />
            </div>

            <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                <input
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    />
            </div>

            <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    />
            </div>

            <div className="mb-4">
            <label htmlFor="skillLevel" className="block text-gray-700 text-sm font-bold mb-2">Skill Level:</label>
                <select
                    id="skillLevel"
                    name="skillLevel"
                    value={formData.skillLevel}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value={SkillLevel.Beginner}>{SkillLevel.Beginner}</option>
                        <option value={SkillLevel.Intermediate}>{SkillLevel.Intermediate}</option>
                        <option value={SkillLevel.Advanced}>{SkillLevel.Advanced}</option>
                </select>
            </div>

            <button 
                    type="submit"
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
        </form>
    );
};

export default RegistrationForm;