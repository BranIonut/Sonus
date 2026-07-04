import { apiClient } from "../lib/api";

export interface SignupRequest {
    username: string;
    name: string;
    email: string;
    password: string;
    role: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface UserResponse {
    userId: string;
    username: string;
    email: string;
}

export interface PublicUserResponse {
    userId: string;
    username: string;
    name: string;
    role: string;
}

export interface UpdateMetadataRequest {
    name?: string;
    email?: string;
    password?: string;
}

export interface AuthReponseWithToken {
    message?: string;
    token: string;
    userId?: string;
    username?: string;
    email?: string;
}

export interface ValidationResponse {
    id: string;
    role: string,
    hasActiveSubscription: boolean;
}

export const AuthService = {
    login: async (credentials: LoginRequest): Promise<string> => {
        const response = await apiClient.post<string>('/api/auth/login', credentials);
        return response.data;
    },

    signup: async (userData: SignupRequest): Promise<UserResponse> => {
        const response = await apiClient.post<UserResponse>('/api/auth/signup', userData);
        return response.data;
    },

    updateUserMetadata: async (userId: string, updatedData: UpdateMetadataRequest): Promise<AuthReponseWithToken> => {
        const response = await apiClient.put<AuthReponseWithToken>(`/api/auth/users/${userId}`, updatedData);
        return response.data;
    },

    validateToken: async (token: string) => {
    const response = await apiClient.post('/api/auth/validate', { token });
    console.log('Token validation response:', response.data);
    return response.data;
  },

    logout: async () => {
        return apiClient.post('/api/auth/logout');
    },

    upgradeToArtist: async (userId: string) => {
        const response = await apiClient.post(`/api/auth/users/${userId}/upgrade-to-artist`);
        return response.data;
    },
    
    updateSubscriptionStatus: async (userId: string, active: boolean = true) => {
        const response = await apiClient.post<AuthReponseWithToken>(`/api/auth/users/${userId}/subscription`, null, { params: { active } });
        return response.data;
    },

    getUserProfile: async (userId: string) => {
        const response = await apiClient.get(`/api/auth/users/${userId}`);
        return response.data;
    },

    deleteAccount: async (userId: string): Promise<void> => {
        const response = await apiClient.delete(`/api/auth/users/${userId}`);
        return response.data;
    },

    getUserByUsername: async (username: string) => {
        const response = await apiClient.get(`/api/auth/users?username=${username}`);
        return response.data;
    },

    searchUsers: async (query: string, limit: number = 10): Promise<PublicUserResponse[]> => {
        const response = await apiClient.get<PublicUserResponse[]>('/api/auth/users/search', {
            params: { q: query, limit }
        });
        return response.data;
    },

    getUserProfilePicture: async (userId: string) => {
        const response = await apiClient.get(`/storage/users-avatars/${userId}`, { responseType: 'blob' });
        return URL.createObjectURL(response.data);
    }
};