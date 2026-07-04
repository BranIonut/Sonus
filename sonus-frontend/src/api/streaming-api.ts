import { apiClient } from "@/lib/api";

export interface PlayEventRequest {
    songId: string;
    userId: string;
    listenDurationSeconds: number;
}

export const StreamingService = {

    getAudioStreamUrl: (objectKey: string): string => {
        const token = localStorage.getItem('authToken');

        const params = new URLSearchParams({ key: objectKey });
        if (token) params.set('access_token', token);

        return `${apiClient.defaults.baseURL}/streaming?${params.toString()}`;
    },

    recordPlayEvent: async (playEvent: PlayEventRequest): Promise<void> => {
        await apiClient.post('/streaming/events/play-event', playEvent);
    },
}