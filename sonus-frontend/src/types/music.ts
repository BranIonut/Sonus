export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  bio?: string;
  followers?: number;
  monthlyListeners?: number;
  genres?: string[];
  verified?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artist: Artist;
  coverUrl: string;
  releaseDate: string;
  totalTracks: number;
  duration: number; 
  genre?: string;
  type: 'album' | 'single' | 'ep';
}

export interface Song {
  id: string;
  title: string;
  artist: Artist;
  album?: Album;
  coverUrl: string;
  duration: number; 
  trackNumber?: number;
  explicit?: boolean;
  previewUrl?: string;
  audioUrl?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  coverUrl: string;
  owner: User;
  songs: Song[];
  totalDuration: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  followers?: number;
}

export interface User {
  userId: string;
  username?: string;
  name?: string;
  role: string;
  email?: string;  
  followers?: number;
  following?: number;
  playlists?: Playlist[];
  hasActiveSubscription?: boolean;
}

export interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
}

export interface SearchResults {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface FetchOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}