import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../services/api/endpoints';
import { apiClient } from '../services/api/client';
import type { User, LoginForm, SignupForm } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

interface AuthContextType extends AuthState {
  login: (credentials: LoginForm) => Promise<void>;
  signup: (userData: SignupForm) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const token = apiClient.getAuthToken();
    console.log('Checking existing token on mount:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (token) {
      // Verify token is still valid
      authApi.getCurrentUser()
        .then(response => {
          console.log('Token verification response:', response);
          if (response.success) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: response.data, token },
            });
            console.log('User authenticated successfully');
          } else {
            console.log('Token verification failed:', response.error);
            // Token is invalid, clear it
            apiClient.clearTokens();
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        })
        .catch((error) => {
          console.log('Token verification error:', error);
          // Token is invalid, clear it
          apiClient.clearTokens();
          dispatch({ type: 'AUTH_LOGOUT' });
        });
    }
  }, []);

  const login = async (credentials: LoginForm) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authApi.login(credentials);
      console.log('Login response:', response);
      
      if (response.success) {
        const authData = response.data;
        console.log('Login data:', authData);
        
        // Handle different response structures
        const user = (authData as any).user || authData;
        const token = authData.token || authData.accessToken;
        const refreshToken = authData.refreshToken;
        
        if (!token) {
          toast.error('No access token received from server');
          dispatch({
            type: 'AUTH_FAILURE',
            payload: 'No access token received',
          });
          return;
        }
        
        // Store tokens
        apiClient.setAuthToken(token);
        if (refreshToken) {
          apiClient.setRefreshToken(refreshToken);
        }
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
        
        toast.success(`Welcome back, ${user.name}!`);
      } else {
        const errorMessage = response.error || 'Login failed';
        toast.error(errorMessage);
        dispatch({
          type: 'AUTH_FAILURE',
          payload: errorMessage,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error(errorMessage);
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage,
      });
    }
  };

  const signup = async (userData: SignupForm) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authApi.signup(userData);
      
      if (response.success) {
        const authData = response.data;
        
        // Handle different response structures
        const user = (authData as any).user || authData;
        const token = authData.token || authData.accessToken;
        const refreshToken = authData.refreshToken;
        
        if (!token) {
          toast.error('No access token received from server');
          dispatch({
            type: 'AUTH_FAILURE',
            payload: 'No access token received',
          });
          return;
        }
        
        // Store tokens
        apiClient.setAuthToken(token);
        if (refreshToken) {
          apiClient.setRefreshToken(refreshToken);
        }
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
        
        toast.success(`Welcome to Pentecost, ${user.name}!`);
      } else {
        const errorMessage = response.error || 'Signup failed';
        toast.error(errorMessage);
        dispatch({
          type: 'AUTH_FAILURE',
          payload: errorMessage,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      toast.error(errorMessage);
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage,
      });
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    } finally {
      // Clear tokens and state regardless of API call success
      apiClient.clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
