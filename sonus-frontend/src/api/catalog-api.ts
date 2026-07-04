import { apiClient } from "@/lib/api";

export type ReleaseType = 'ALBUM' | 'SINGLE' | 'EP';

export interface Song {
    songId?: string;
    title: string;
    durationSeconds: number;
    objectKey?: string;
}

export interface Album {
    albumId?: string;
    artistId: string;
    title: string;
    description?: string;
    genre: string;
    releaseDate: string;
    recordLabel?: string;
    copyright?: string;
    coverUrl?: string;
    releaseType: ReleaseType;
    songs: Song[];
}

export interface SearchResultDto {
    songs: Song[];
    albums: Album[];
}

export interface CreateAlbumRequest {
    title: string;
    description?: string;
    genre: string;
    type: ReleaseType;
    releaseDate?: string;
    recordLabel?: string;
    copyright?: string;
    coverUrl?: string;
}

export const CatalogService = {

    search: async (query: string): Promise<SearchResultDto> => {
        const response = await apiClient.get<SearchResultDto>(`/api/catalogs/search?`, { params: { query } });

        return response.data;
    },

    getAllAlbums: async (
        genre?: string,
        page: number = 0,
        size: number = 20,
    ): Promise<Album[]> => {
        const response = await apiClient.get<Album[]>('/api/catalogs/albums', {
            params: {
                genre,
                page,
                size,
            },
        });
        return response.data;
    },

    createAlbum: async (artistId: string, album: CreateAlbumRequest): Promise<Album> => {
        const response = await apiClient.post<Album>('/api/catalogs/albums', album,
        );
        return response.data;
    },

    getFullAlbum: async (albumId: string): Promise<Album> => {
        const response = await apiClient.get<Album>(`/api/catalogs/albums/${albumId}`);
        return response.data;
    },

    getArtistAlbums: async (artistId: string): Promise<Album[]> => {
        const response = await apiClient.get<Album[]>(`/api/catalogs/artists/${artistId}/albums`);
        return response.data;
    },

    addSongToAlbum: async (artistId: string, albumId: string, song: Song): Promise<Album> => {
        const response = await apiClient.post<Album>(
            `/api/catalogs/albums/${albumId}/songs`,
            song,
        );
        return response.data;
    },
    getSong: async (songId: string): Promise<Song> => {
        const response = await apiClient.get<Song>(`/api/catalogs/songs/${songId}`);
        return response.data;
    },
    
    updateAlbumCover: async (albumId: string, coverUrl: string): Promise<void> => {
        await apiClient.patch(`/api/catalogs/albums/${albumId}/cover`, { coverUrl });
    },

    deleteAlbum: async (albumId: string): Promise<void> => {
        await apiClient.delete(`/api/catalogs/albums/${albumId}`);
    },

};
