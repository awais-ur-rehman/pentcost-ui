import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
          <p className="text-gray-600">Welcome, {user?.name}. Manage your account settings.</p>
          <p className="text-sm text-gray-500 mt-2">
            User preferences, language settings, and notification preferences will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}
