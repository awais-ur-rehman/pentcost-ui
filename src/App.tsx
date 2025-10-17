import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ContractProvider } from './contexts/ContractContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy load pages for better performance
const Login = React.lazy(() => import('./pages/public/Login'));
const Signup = React.lazy(() => import('./pages/public/Signup'));
const Dashboard = React.lazy(() => import('./pages/private/Dashboard'));
const CreateContract = React.lazy(() => import('./pages/private/CreateContract'));
const EditContract = React.lazy(() => import('./pages/private/EditContract'));
const ContractView = React.lazy(() => import('./pages/private/ContractView'));
const VersionHistory = React.lazy(() => import('./pages/private/VersionHistory'));
const Settings = React.lazy(() => import('./pages/private/Settings'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <LanguageProvider>
            <ContractProvider>
            <div className="min-h-screen bg-gray-50">
              <React.Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
                </div>
              }>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  
                  {/* Protected routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contracts/new"
                    element={
                      <ProtectedRoute>
                        <CreateContract />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contracts/:id/edit"
                    element={
                      <ProtectedRoute>
                        <EditContract />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contracts/:id"
                    element={
                      <ProtectedRoute>
                        <ContractView />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contracts/:id/history"
                    element={
                      <ProtectedRoute>
                        <VersionHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Default redirect */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* 404 fallback */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </React.Suspense>
            </div>
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </ContractProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
    <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;