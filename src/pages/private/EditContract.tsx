import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function EditContract() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Edit Contract</h1>
          <p className="text-gray-600">Welcome, {user?.name}. Editing contract ID: {id}</p>
          <p className="text-sm text-gray-500 mt-2">
            The contract editor with AI-powered translation, proofreading, and rewriting will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}
