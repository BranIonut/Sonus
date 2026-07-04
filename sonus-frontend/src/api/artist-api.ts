import { apiClient } from "@/lib/api";

export interface ArtistProfile {
    userId: string;
    stageName: string;
    bio?: string;
    profilePictureUrl?: string;
    genre?: string;
    contactEmail?: string;
    socialLinks?: Record<string, string>;
    isVerified: boolean;
    followersCount?: number;
    followingCount?: number;
}

export interface UpdateArtistProfileRequest {
    stageName?: string;
    bio?: string;
    profilePictureUrl?: string;
    genre?: string;
    contactEmail?: string;
    socialLinks?: Record<string, string>;
}

export const ArtistService = {

    getAllArtists: async (): Promise<ArtistProfile[]> => {
        const response = await apiClient.get<ArtistProfile[]>('/api/artists');
        return response.data;
    },

    searchArtists: async (query: string): Promise<ArtistProfile[]> => {
        const response = await apiClient.get<ArtistProfile[]>(`/api/artists/search`, { params: { query } });
        return response.data;
    },

    getArtistProfile: async (userId: string): Promise<ArtistProfile> => {
        const response = await apiClient.get<ArtistProfile>(`/api/artists/${userId}`);
        return response.data;
    },

    updateArtistProfile: async (
        userId: string,
        profile: UpdateArtistProfileRequest
    ): Promise<ArtistProfile> => {
        const response = await apiClient.put<ArtistProfile>(
            `/api/artists/${userId}`,
             { userId, ...profile }
        );
        return response.data;
    },
    
    deleteArtistProfile: async (userId: string): Promise<void> => {
        await apiClient.delete(`/api/artists/${userId}`);    
    },

    incrementFollowers: async (userId: string): Promise<ArtistProfile> => {
        const response = await apiClient.put<ArtistProfile>(`/api/artists/${userId}/followers/increment`);
        return response.data;
    },

    decrementFollowers: async (userId: string): Promise<ArtistProfile> => {
        const response = await apiClient.put<ArtistProfile>(`/api/artists/${userId}/followers/decrement`);
        return response.data;
    },

};
