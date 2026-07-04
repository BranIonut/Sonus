import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

const STORAGE_BASE = 'http://localhost:9040/storage'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function getFallbackAvatarUrl(): string {
  return `${STORAGE_BASE}/users-avatars/newuser.png`;
}

export function getUserAvatar(userId: string | null | undefined): string {
  if (!userId) return getFallbackAvatarUrl();
  if (userId.startsWith('http') || userId.startsWith('/') || userId.startsWith('data:')) return userId;
  return `${STORAGE_BASE}/users-avatars/${userId}.png`;
}

export function getAlbumCoverUrl(coverUrl: string | null | undefined): string {
  if (!coverUrl) return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%231a1a2e'/%3E%3Ccircle cx='100' cy='100' r='50' fill='%23e94560' opacity='0.3'/%3E%3Ccircle cx='100' cy='100' r='25' fill='%23e94560' opacity='0.5'/%3E%3Ccircle cx='100' cy='100' r='8' fill='%23e94560'/%3E%3C/svg%3E`;
  if (coverUrl.startsWith('http') || coverUrl.startsWith('/') || coverUrl.startsWith('data:')) {
    return coverUrl;
  }
  return `${STORAGE_BASE}/album-covers/${coverUrl}.png`;
}

export function getArtistImageUrl(artistId: string | null | undefined): string {
  if (!artistId) return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%231a1a2e'/%3E%3Ccircle cx='100' cy='85' r='35' fill='%23e94560' opacity='0.6'/%3E%3Cellipse cx='100' cy='160' rx='55' ry='40' fill='%23e94560' opacity='0.4'/%3E%3C/svg%3E`;
  if (artistId.startsWith('http') || artistId.startsWith('/') || artistId.startsWith('data:')) return artistId;
  return `${STORAGE_BASE}/artists-profile-covers/${artistId}.png`;
}

export function getPlaylistCoverUrl(playlistId: string | null | undefined): string {
  if (!playlistId) return '/placeholder-album.png';
  return `${STORAGE_BASE}/playlist-covers/${playlistId}.png`;
}

