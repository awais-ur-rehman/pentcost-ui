import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthForm } from '../../components/auth/AuthForm';

export default function Signup() {
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center">
            <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-semibold text-gray-900">Pentecost</h1>
            </div>
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-card p-8">
          <div className="text-center mb-8">
            <h2 className="heading-2 text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="body-regular text-gray-600">
              Start collaborating on contracts across languages
            </p>
          </div>
          
          <AuthForm mode="signup" />
        </div>
        
        {/* Footer */}
        <div className="text-center">
          <p className="body-small text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
