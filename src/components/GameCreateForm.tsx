'use client';
import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';

interface User {
    id: string;
}

interface SessionData {
    user: User | null;
}

interface GameFormData {
    title: string;
    description: string;
    address: string;
    latitude: string;
    longitude: string;
    dateTime: string;
    maxPLayers: number;
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    price: number;
}

const GameCreateForm = () => {
  const { data: session } = useSession() as {data: SessionData | null}
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    dateTime: '',
    maxPlayers: 10,
    skillLevel: 'intermediate',
    price: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      setError('You must be logged in to create a game');
      return;
    }

    // Validate coordinates
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
        setError('Invalid coordinates. Please enter valid numbers for latitude and longitude.');
        return;
    }

    // Validate date
    const gameDate = new Date(formData.dateTime);
    if (isNaN(gameDate.getTime())) {
        setError('Invalid date format');
        return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: {
            type: 'Point',
            coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
            address: formData.address,
          },
          dateTime: new Date(formData.dateTime),
          maxPlayers: parseInt(formData.maxPlayers.toString()),
          organizer: session.user.id,
          skillLevel: formData.skillLevel,
          price: parseFloat(formData.price.toString()),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create game');
      }
      
        const game = await response.json();
        router.push(`/games/${game._id}`);
    } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
        setError(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Soccer Game</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={3}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Latitude</label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Longitude</label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Date & Time</label>
          <input
            type="datetime-local"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Max Players</label>
            <input
              type="number"
              name="maxPlayers"
              value={formData.maxPlayers}
              onChange={handleChange}
              min={2}
              max={30}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Skill Level</label>
            <select
              name="skillLevel"
              value={formData.skillLevel}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min={0}
              step={0.01}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Creating...' : 'Create Game'}
        </button>
      </form>
    </div>
  );
};

export default GameCreateForm;