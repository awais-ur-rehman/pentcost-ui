import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ApiResponse } from '../../types';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log('Request with token:', token.substring(0, 20) + '...');
                } else {
                    console.log('No auth token found for request');
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor to handle common errors
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                return response;
            },
            async (error) => {
                if (error.response?.status === 401) {
                    // Token expired, try to refresh
                    const refreshToken = localStorage.getItem('refresh_token');
                    if (refreshToken) {
                        try {
                            const response = await this.client.post('/auth/refresh', {
                                refreshToken,
                            });
                            const { token } = response.data.data;
                            localStorage.setItem('auth_token', token);
                            // Retry original request
                            return this.client.request(error.config);
                        } catch (refreshError) {
                            // Refresh failed, redirect to login
                            localStorage.removeItem('auth_token');
                            localStorage.removeItem('refresh_token');
                            window.location.href = '/login';
                        }
                    } else {
                        // No refresh token, redirect to login
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.client.get(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.client.post(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.client.put(url, data, config);
        return response.data;
    }

    async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.client.patch(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.client.delete(url, config);
        return response.data;
    }

    setAuthToken(token: string) {
        localStorage.setItem('auth_token', token);
        console.log('Auth token stored:', token.substring(0, 20) + '...');
    }

    setRefreshToken(token: string) {
        localStorage.setItem('refresh_token', token);
        console.log('Refresh token stored:', token.substring(0, 20) + '...');
    }

    clearTokens() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        console.log('Tokens cleared from localStorage');
    }

    getAuthToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }
}

export const apiClient = new ApiClient();
export default apiClient;
