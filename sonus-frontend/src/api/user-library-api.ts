import { apiClient } from "@/lib/api";

export interface UserLibrary {
    userId: string;
    likedSongs: string[];
    savedAlbums: string[];
    followedArtists?: string[];
    followedUsers?: string[];
}

export interface BackendPlaylist {
    id?: string;
    userId: string;
    title: string;
    description?: string;
    creationDate: string;
    songs: string[];
}

export interface CreatePlaylistRequest {
    title: string;
    description: string;
}

export const LibraryService = {

    getMyLibrary: async (): Promise<UserLibrary> => {
        const response = await apiClient.get<UserLibrary>('/api/library/me');
        return response.data;
    },

    toggleLikeSong: async (songId: string): Promise<UserLibrary> => {
        const response = await apiClient.post<UserLibrary>(
            `/api/library/liked-songs/${songId}`
        );
        return response.data;
    },

    toggleSaveAlbum: async (albumId: string): Promise<UserLibrary> => {
        const response = await apiClient.post<UserLibrary>(
            `/api/library/saved-albums/${albumId}`
        );
        return response.data;
    },

    toggleFollowArtist: async (artistId: string): Promise<UserLibrary> => {
        const response = await apiClient.post<UserLibrary>(
            `/api/library/followed-artists/${artistId}`
        );
        return response.data;
    },

    toggleFollowUser: async (userId: string): Promise<UserLibrary> => {
        const response = await apiClient.post<UserLibrary>(
            `/api/library/followed-users/${userId}`
        );
        return response.data;
    },

    getArtistFollowerCount: async (artistId: string): Promise<number> => {
        const response = await apiClient.get<number>(
            `/api/library/artists/${artistId}/followers/count`
        );
        return response.data;
    },

    getUserFollowerCount: async (userId: string): Promise<number> => {
        const response = await apiClient.get<number>(
            `/api/library/users/${userId}/followers/count`
        );
        return response.data;
    },

    getUserFollowingCount: async (userId: string): Promise<number> => {
        const response = await apiClient.get<number>(
            `/api/library/users/${userId}/following/count`
        );
        return response.data;
    },
};

export const PlaylistService = {

    getMyPlaylists: async (): Promise<BackendPlaylist[]> => {
        const response = await apiClient.get<BackendPlaylist[]>('/api/playlists/me');
        return response.data;
    },

    getPlaylist: async (playlistId: string): Promise<BackendPlaylist> => {
        const response = await apiClient.get<BackendPlaylist>(`/api/playlists/${playlistId}`);
        return response.data;
    },

    createPlaylist: async (playlistData: CreatePlaylistRequest): Promise<BackendPlaylist> => {
        const response = await apiClient.post<BackendPlaylist>('/api/playlists', playlistData);
        return response.data;
    },

    addSongToPlaylist: async (playlistId: string, songId: string): Promise<BackendPlaylist> => {
        const response = await apiClient.post<BackendPlaylist>(
            `/api/playlists/${playlistId}/songs/${songId}`
        );
        return response.data;
    },

    removeSongFromPlaylist: async (playlistId: string, songId: string): Promise<BackendPlaylist> => {
        const response = await apiClient.delete<BackendPlaylist>(
            `/api/playlists/${playlistId}/songs/${songId}`
        );
        return response.data;
    },

    deletePlaylist: async (playlistId: string): Promise<void> => {
        await apiClient.delete(`/api/playlists/${playlistId}`);
    },
};