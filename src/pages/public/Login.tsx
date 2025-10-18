import React, { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthForm } from '../../components/auth/AuthForm';

export default function Login() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
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
              Welcome back
            </h2>
            <p className="body-regular text-gray-600">
              Sign in to continue to Pentecost
            </p>
          </div>
          
          <AuthForm mode="login" />
        </div>
        
        {/* Footer */}
        <div className="text-center">
          <p className="body-small text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary-hover font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
