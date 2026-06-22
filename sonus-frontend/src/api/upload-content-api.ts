import { apiClient } from "../lib/api";

export interface InitUploadRequest {
    albumId: string;
    extension: string;
}

export interface InitUploadResponse {
    songId: string;
    presignedUrl: string;
    objectKey: string;
}

export interface CoverUploadResponse {
    presignedUrl: string;
    coverUrl: string;
    expiresInSeconds: number;
}

export interface ConfirmUploadRequest {
    songId: string;
    albumId: string;
    title: string;
    durationSeconds: number;
    isExplicit: boolean;
    features: string;
    trackNumber: number;
}

export interface SongMetadata {
    id: string;
    albumId: string;
    title: string;
    duration: string;
    isExplicit: boolean;
    features: string;
    trackNumber: number;
    objectKey: string;
}

export interface CreateAlbumRequest {
    title: string;
    description: string;
    type: string;
    genre: string;
    releaseDate: string;
    recordLabel: string;
    copyright: string;
    coverUrl?: string;
}

export interface AlbumResponse {
    albumId: string;
    artistId: string;
    title: string;
    description: string;
    type: string;
    genre: string;
    releaseDate: string;
    recordLabel: string;
    copyright: string;
    coverUrl?: string;
    songs?: SongMetadata[];
}

export const UploadContentService = {

    uploadCoverArt: async (
        artistId: string,
        albumId: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<string> => {

        const initResponse = await apiClient.post<CoverUploadResponse>(
            `/api/upload/cover/${albumId}`,
            {},
        );

        const { presignedUrl, coverUrl } = initResponse.data;

        await UploadContentService.putFileToMinIO(presignedUrl, file, onProgress);

        return coverUrl;
    },

    uploadProfilePicture: async (
        userId: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<string> => {
        const initResponse = await apiClient.post<CoverUploadResponse>(
            `/api/upload/profile-picture/${userId}`,
            {}
        );

        const { presignedUrl, coverUrl } = initResponse.data;

        await UploadContentService.putFileToMinIO(presignedUrl, file, onProgress);

        return coverUrl;
    },

    uploadPlaylistCover: async (
        playlistId: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<string> => {
        const initResponse = await apiClient.post<CoverUploadResponse>(
            `/api/upload/playlist-cover/${playlistId}`,
            {}
        );

        const { presignedUrl, coverUrl } = initResponse.data;

        await UploadContentService.putFileToMinIO(presignedUrl, file, onProgress);

        return coverUrl;
    },

    initTrackUpload: async (
        artistId: string,
        albumId: string,
        extension: string
    ): Promise<InitUploadResponse> => {
        const response = await apiClient.post<InitUploadResponse>("/api/upload/init",
            { albumId, extension } satisfies InitUploadRequest,
        );
        return response.data;
    },

    putFileToMinIO: async (
        presignedUrl: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<void> => {

        const directUrl = presignedUrl.replace('http://minio:9000', 'http://localhost:9040/storage');

        await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", directUrl);

            xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

            xhr.upload.onprogress = (event) => {
                if (onProgress && event.lengthComputable) {
                    onProgress(Math.round((event.loaded * 100) / event.total));
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`MinIO PUT failed: ${xhr.status} — check CORS policy on the bucket`));
                }
            };

            xhr.onerror = () => reject(new Error("Network error — is MinIO reachable on localhost:9000?"));
            xhr.send(file);
        });
    },

    confirmTrackUpload: async (
        artistId: string,
        data: ConfirmUploadRequest
    ): Promise<SongMetadata> => {
        const response = await apiClient.patch<SongMetadata>("/api/upload/confirm",
            data
        );

        return response.data;
    },

    createAlbum: async (artistId: string, data: CreateAlbumRequest): Promise<AlbumResponse> => {
        const response = await apiClient.post<AlbumResponse>(
            '/api/catalogs/albums',
            data,
        );
        return response.data;
    },
};