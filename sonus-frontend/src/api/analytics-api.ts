import { apiClient } from "@/lib/api";

export interface PlayHistoryEntry {
    songId: string;
    artistId: string;
    playedAt: string;
}

export interface RankedEntry {
    id: string;
    playCount: number;
}

export interface UserStatsDto {
    userId: string;
    totalPlays: number;
    uniqueSongs: number;
    uniqueArtists: number;
    topSongs: RankedEntry[];
    topArtists: RankedEntry[];
}

export interface SongsStatsDto {
    songId: string;
    totalPlays: number;
}

export interface ArtistStatsDto {
    artistId: string;
    totalPlays: number;
    uniqueListeners: number;
}

export const AnalyticsService = {

    getUserHistory: async (
        userId: string,
        limit: number = 50,
    ) : Promise<PlayHistoryEntry[]> => {
        const response = await apiClient.get<PlayHistoryEntry[]>(`/api/stats/users/${userId}/history`, {
            params: { limit },
        });
        return response.data;
    },
    
    getUserStats: async (userId: string, topN: number = 5): Promise<UserStatsDto> => {
        const response = await apiClient.get<UserStatsDto>(`/api/stats/users/${userId}/stats`, {
            params: { topN },
        });
        return response.data;
    },

    getTopSongs: async (userId: string, limit: number = 10): Promise<RankedEntry[]> => {
        const response = await apiClient.get<RankedEntry[]>(`/api/stats/users/${userId}/top-songs`, {
            params: { limit },
        });
        return response.data;
    },

    getTopArtists: async (userId: string, limit: number = 10): Promise<RankedEntry[]> => {
        const response = await apiClient.get<RankedEntry[]>(`/api/stats/users/${userId}/top-artists`, {
            params: { limit },
        });
        return response.data;
    },

    getSongStats: async (songId: string): Promise<SongsStatsDto> => {
        const response = await apiClient.get<SongsStatsDto>(`/api/stats/songs/${songId}`);
        return response.data;
    },

    getArtistStats: async (artistId: string): Promise<ArtistStatsDto> => {
        const response = await apiClient.get<ArtistStatsDto>(`/api/stats/artists/${artistId}`);
        return response.data;
    },

    getRecommendations: async (userId: string, limit: number = 10): Promise<string[]> => {
        const response = await apiClient.get<string[]>(`/api/stats/users/${userId}/recommendations`, {
            params: { limit },
        });
        return response.data;
    },
};