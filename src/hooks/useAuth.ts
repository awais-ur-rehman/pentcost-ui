import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/api/endpoints';
import { apiClient } from '../services/api/client';
import type { LoginForm, SignupForm } from '../types';

// Query keys
export const authKeys = {
    all: ['auth'] as const,
    user: () => [...authKeys.all, 'user'] as const,
};

// Get current user
export function useCurrentUser() {
    return useQuery({
        queryKey: authKeys.user(),
        queryFn: async () => {
            const response = await authApi.getCurrentUser();
            if (!response.success) {
                throw new Error(response.error || 'Failed to get current user');
            }
            return response.data;
        },
        retry: false,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginForm) => {
      const response = await authApi.login(credentials);
      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }
      return response.data;
    },
    onSuccess: (data) => {
      const user = (data as any).user || data;
      const token = data.accessToken || data.token;
      const refreshToken = data.refreshToken;
      
      // Store tokens in localStorage
      if (token) {
        apiClient.setAuthToken(token);
      }
      if (refreshToken) {
        apiClient.setRefreshToken(refreshToken);
      }
      
      // Update the user query cache
      queryClient.setQueryData(authKeys.user(), user);
    },
  });
}

// Signup mutation
export function useSignup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: SignupForm) => {
      const response = await authApi.signup(userData);
      if (!response.success) {
        throw new Error(response.error || 'Signup failed');
      }
      return response.data;
    },
    onSuccess: (data) => {
      const user = (data as any).user || data;
      const token = data.accessToken || data.token;
      const refreshToken = data.refreshToken;
      
      // Store tokens in localStorage
      if (token) {
        apiClient.setAuthToken(token);
      }
      if (refreshToken) {
        apiClient.setRefreshToken(refreshToken);
      }
      
      // Update the user query cache
      queryClient.setQueryData(authKeys.user(), user);
    },
  });
}

// Logout mutation
export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await authApi.logout();
            if (!response.success) {
                throw new Error(response.error || 'Logout failed');
            }
            return response.data;
        },
        onSuccess: () => {
            // Clear all auth-related queries
            queryClient.clear();
        },
    });
}
