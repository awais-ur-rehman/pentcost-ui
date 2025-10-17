import { apiClient } from './client';
import type {
    AuthUser,
    User,
    Contract,
    Commit,
    Branch,
    Comment,
    Notification,
    LoginForm,
    SignupForm,
    ContractForm,
    CreateContractRequest,
    CommitForm,
    ApiResponse,
    PaginatedResponse,
} from '../../types';

// Auth endpoints
export const authApi = {
    login: async (credentials: LoginForm): Promise<ApiResponse<AuthUser>> => {
        return apiClient.post('/auth/login', credentials);
    },

    signup: async (userData: SignupForm): Promise<ApiResponse<AuthUser>> => {
        return apiClient.post('/auth/signup', userData);
    },

    refreshToken: async (refreshToken: string): Promise<ApiResponse<{ token: string }>> => {
        return apiClient.post('/auth/refresh', { refreshToken });
    },

    getCurrentUser: async (): Promise<ApiResponse<User>> => {
        return apiClient.get('/auth/me');
    },

    logout: async (): Promise<ApiResponse<void>> => {
        return apiClient.post('/auth/logout');
    },
};

// Contract endpoints
export const contractApi = {
    getContracts: async (page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Contract>>> => {
        return apiClient.get(`/contracts?page=${page}&limit=${limit}`);
    },

    getContract: async (id: string): Promise<ApiResponse<Contract>> => {
        return apiClient.get(`/contracts/${id}`);
    },

    createContract: async (contractData: CreateContractRequest): Promise<ApiResponse<Contract>> => {
        return apiClient.post('/contracts', contractData);
    },

    updateContract: async (id: string, contractData: Partial<ContractForm>): Promise<ApiResponse<Contract>> => {
        return apiClient.put(`/contracts/${id}`, contractData);
    },

    deleteContract: async (id: string): Promise<ApiResponse<void>> => {
        return apiClient.delete(`/contracts/${id}`);
    },

    shareContract: async (id: string, shareData: { userIds: string[]; permissions: string[] }): Promise<ApiResponse<void>> => {
        return apiClient.post(`/contracts/${id}/share`, shareData);
    },

    signContract: async (id: string, signatureData: { signature: string; signatureData: string }): Promise<ApiResponse<Contract>> => {
        return apiClient.post(`/contracts/${id}/sign`, signatureData);
    },

    finalizeContract: async (id: string): Promise<ApiResponse<Contract>> => {
        return apiClient.post(`/contracts/${id}/finalize`);
    },
};

// Version control endpoints
export const versionApi = {
    getVersions: async (contractId: string): Promise<ApiResponse<Commit[]>> => {
        return apiClient.get(`/contracts/${contractId}/versions`);
    },

    getVersion: async (contractId: string, versionId: string): Promise<ApiResponse<Commit>> => {
        return apiClient.get(`/contracts/${contractId}/versions/${versionId}`);
    },

    commitChanges: async (contractId: string, commitData: CommitForm): Promise<ApiResponse<Commit>> => {
        return apiClient.post(`/contracts/${contractId}/versions/commit`, commitData);
    },

    pullChanges: async (contractId: string): Promise<ApiResponse<Contract>> => {
        return apiClient.post(`/contracts/${contractId}/versions/pull`);
    },

    getDiff: async (contractId: string, fromVersion?: number, toVersion?: number): Promise<ApiResponse<any>> => {
        const params = new URLSearchParams();
        if (fromVersion) params.append('fromVersion', fromVersion.toString());
        if (toVersion) params.append('toVersion', toVersion.toString());
        const queryString = params.toString();
        return apiClient.get(`/contracts/${contractId}/versions/diff${queryString ? `?${queryString}` : ''}`);
    },

    rollback: async (contractId: string, versionId: string): Promise<ApiResponse<Contract>> => {
        return apiClient.post(`/contracts/${contractId}/versions/rollback`, { versionId });
    },
};

// Branch endpoints
export const branchApi = {
    getBranches: async (contractId: string): Promise<ApiResponse<Branch[]>> => {
        return apiClient.get(`/contracts/${contractId}/branches`);
    },

    createBranch: async (contractId: string, branchData: { name: string; description: string; baseCommitId: string }): Promise<ApiResponse<Branch>> => {
        return apiClient.post(`/contracts/${contractId}/branches`, branchData);
    },

    mergeBranch: async (contractId: string, branchId: string): Promise<ApiResponse<Branch>> => {
        return apiClient.post(`/contracts/${contractId}/branches/${branchId}/merge`);
    },

    deleteBranch: async (contractId: string, branchId: string): Promise<ApiResponse<void>> => {
        return apiClient.delete(`/contracts/${contractId}/branches/${branchId}`);
    },
};

// Collaboration endpoints
export const collaborationApi = {
    getComments: async (contractId: string): Promise<ApiResponse<Comment[]>> => {
        return apiClient.get(`/contracts/${contractId}/comments`);
    },

    addComment: async (contractId: string, commentData: { content: string; lineNumber?: number; parentCommentId?: string }): Promise<ApiResponse<Comment>> => {
        return apiClient.post(`/contracts/${contractId}/comments`, commentData);
    },

    updateComment: async (contractId: string, commentId: string, content: string): Promise<ApiResponse<Comment>> => {
        return apiClient.put(`/contracts/${contractId}/comments/${commentId}`, { content });
    },

    deleteComment: async (contractId: string, commentId: string): Promise<ApiResponse<void>> => {
        return apiClient.delete(`/contracts/${contractId}/comments/${commentId}`);
    },

    resolveComment: async (contractId: string, commentId: string): Promise<ApiResponse<Comment>> => {
        return apiClient.patch(`/contracts/${contractId}/comments/${commentId}/resolve`);
    },

    getNotifications: async (): Promise<ApiResponse<Notification[]>> => {
        return apiClient.get('/notifications');
    },

    markNotificationAsRead: async (notificationId: string): Promise<ApiResponse<void>> => {
        return apiClient.put(`/notifications/${notificationId}/read`);
    },

    deleteNotification: async (notificationId: string): Promise<ApiResponse<void>> => {
        return apiClient.delete(`/notifications/${notificationId}`);
    },
};

// User endpoints
export const userApi = {
    getUsers: async (search?: string): Promise<ApiResponse<User[]>> => {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        return apiClient.get(`/users${params}`);
    },

    getUser: async (id: string): Promise<ApiResponse<User>> => {
        return apiClient.get(`/users/${id}`);
    },

    updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
        return apiClient.put('/users/profile', userData);
    },

    updateSettings: async (settings: any): Promise<ApiResponse<void>> => {
        return apiClient.put('/users/settings', settings);
    },
};

export default {
    auth: authApi,
    contract: contractApi,
    version: versionApi,
    branch: branchApi,
    collaboration: collaborationApi,
    user: userApi,
};
