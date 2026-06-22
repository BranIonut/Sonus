import useSWR from 'swr';
import axios from 'axios';
import type { Artist, Album, Song, Playlist, User, SearchResults } from '../types/music';
import { ArtistProfile, ArtistService } from '@/api/artist-api';
import { CatalogService } from '@/api/catalog-api';
import { getAlbumCoverUrl, getPlaylistCoverUrl, getArtistImageUrl } from './utils';

export const apiClient = axios.create({
  baseURL: 'http://localhost:9040',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

function mapArtistProfileToArtist(profile: ArtistProfile): Artist {
  return {
    id: profile.userId,
    name: profile.stageName,
    imageUrl: (profile as any).profilePictureURL || profile.profilePictureUrl || getArtistImageUrl(profile.userId),
    bio: profile.bio,
    genres: profile.genre ? [profile.genre] : [],
    verified: profile.isVerified,
    followers: profile.followersCount || 0,
  };
}

let cachedArtistMap: Record<string, Artist> | null = null;
let lastFetchTime = 0;

export function invalidateArtistCache() {
  cachedArtistMap = null;
  lastFetchTime = 0;
}

async function fetchArtistMap(): Promise<Record<string, Artist>> {
  if (cachedArtistMap && Date.now() - lastFetchTime < 10000) {
    return cachedArtistMap;
  }
  try {
    const profiles = await ArtistService.getAllArtists();
    const map: Record<string, Artist> = {};
    profiles.forEach(p => {
      map[p.userId] = mapArtistProfileToArtist(p);
    });
    cachedArtistMap = map;
    lastFetchTime = Date.now();
    return map;
  } catch (e) {
    console.error("Failed to fetch artists for map", e);
    return cachedArtistMap || {};
  }
}

function mapCatalogAlbumToAlbum(backendAlbum: any, artist?: Artist): Album {
  return {
    id: backendAlbum.albumId,
    title: backendAlbum.title,
    artist: artist || {
      id: backendAlbum.artistId || '',
      name: 'Unknown Artist',
      imageUrl: '/placeholder-artist.png',
    },
    coverUrl: getAlbumCoverUrl(backendAlbum.coverUrl),
    releaseDate: backendAlbum.releaseDate,
    totalTracks: backendAlbum.songs?.length || 0,
    duration: backendAlbum.songs?.reduce(
      (acc: number, s: any) => acc + (s.durationSeconds || 0), 0
    ) || 0,
    genre: backendAlbum.genre,
    type: (backendAlbum.type || backendAlbum.releaseType || 'album').toLowerCase() as Album['type'],
  };
}

function mapCatalogSongToSong(backendSong: any, album?: Album, artist?: Artist): Song {
  let extractedArtistId = backendSong.artistId || backendSong.artist?.id;
  let extractedAlbumId = backendSong.albumId || backendSong.album?.id || backendSong.album?.albumId;

  if (backendSong.objectKey) {
    const parts = backendSong.objectKey.split('/');
    if (parts.length >= 3) {
      if (!extractedArtistId) extractedArtistId = parts[0];
      if (!extractedAlbumId) extractedAlbumId = parts[1];
    }
  }

  return {
    id: backendSong.songId,
    title: backendSong.title,
    artist: artist || album?.artist || {
      id: extractedArtistId || '',
      name: 'Unknown Artist',
      imageUrl: extractedArtistId ? getArtistImageUrl(extractedArtistId) : '/placeholder-artist.png',
    },
    album: album,
    coverUrl: album?.coverUrl || getAlbumCoverUrl(extractedAlbumId),
    duration: backendSong.durationSeconds,
    trackNumber: backendSong.trackNumber,
    explicit: backendSong.isExplicit,
    audioUrl: backendSong.objectKey || undefined
  };
}

export function useSearch(query: string) {
  return useSWR(
    query ? ['search', query] : null,
    async () => {

      const [catalogResult, artistMap, artistProfiles, allBackendAlbums] = await Promise.all([
        CatalogService.search(query),
        fetchArtistMap(),
        ArtistService.searchArtists(query).catch(() => [] as ArtistProfile[]),
        CatalogService.getAllAlbums(undefined, 0, 500).catch(() => [] as Awaited<ReturnType<typeof CatalogService.getAllAlbums>>),
      ]);

      const missingArtistIds = new Set<string>();
      for (const a of [...catalogResult.albums, ...allBackendAlbums]) {
        if (a.artistId && !artistMap[a.artistId]) missingArtistIds.add(a.artistId);
      }
      if (missingArtistIds.size > 0) {
        await Promise.all([...missingArtistIds].map(async (id) => {
          try {
            const p = await ArtistService.getArtistProfile(id);
            artistMap[id] = mapArtistProfileToArtist(p);
          } catch (_) {  }
        }));
      }

      const artists: Artist[] = artistProfiles.map(p => ({
        id: p.userId,
        name: p.stageName,
        imageUrl: (p as any).profilePictureURL || p.profilePictureUrl || getArtistImageUrl(p.userId),
        bio: p.bio,
        genres: p.genre ? [p.genre] : [],
        verified: p.isVerified,
      }));

      const albums = catalogResult.albums.map(a =>
        mapCatalogAlbumToAlbum(a, artistMap[a.artistId])
      );

      type SongEntry = { song: Parameters<typeof mapCatalogSongToSong>[0]; album: ReturnType<typeof mapCatalogAlbumToAlbum>; artist: Artist | undefined };
      const songLookup = new Map<string, SongEntry>();
      for (const backendAlbum of allBackendAlbums) {
        if (!backendAlbum.songs?.length) continue;
        const album = mapCatalogAlbumToAlbum(backendAlbum, artistMap[backendAlbum.artistId]);
        const artist = artistMap[backendAlbum.artistId];
        for (const s of backendAlbum.songs) {
          if (s.songId) {
            songLookup.set(s.songId, { song: s, album, artist });
          }
        }
      }

      const songs: Song[] = catalogResult.songs.map(s => {
        const entry = s.songId ? songLookup.get(s.songId) : undefined;
        if (entry) {
          return mapCatalogSongToSong(entry.song, entry.album, entry.artist);
        }
        return mapCatalogSongToSong(s);
      });

      return { songs, albums, artists, playlists: [] as Playlist[] } satisfies SearchResults;
    },
    { dedupingInterval: 300 }
  );
}

export function useAlbums(genre?: string) {
  return useSWR(
    ['albums', genre],
    async () => {
      const albums = await CatalogService.getAllAlbums(genre);
      const artistMap = await fetchArtistMap();

      const missing = [...new Set(albums.map(a => a.artistId).filter(id => id && !artistMap[id]))];
      if (missing.length > 0) {
        await Promise.all(missing.map(async (id) => {
          try {
            const p = await ArtistService.getArtistProfile(id);
            artistMap[id] = mapArtistProfileToArtist(p);
          } catch (_) { }
        }));
      }
      return albums.map(a => mapCatalogAlbumToAlbum(a, artistMap[a.artistId]));
    }
  );
}

export function useArtists() {
  return useSWR(
    'artists',
    async () => {
      const artists = await ArtistService.getAllArtists();
      return artists.map(mapArtistProfileToArtist);
    }
  );
}

export function useArtist(userId: string) {
  return useSWR(
    userId ? ['artist', userId] : null,
    async () => {
      const profile = await ArtistService.getArtistProfile(userId);
      return mapArtistProfileToArtist(profile);
    }
  );
}

export function useArtistAlbums(artistId: string) {
  return useSWR(
    artistId ? ['artist-albums', artistId] : null,
    async () => {
      const [albums, artistProfile] = await Promise.all([
        CatalogService.getArtistAlbums(artistId),
        ArtistService.getArtistProfile(artistId).catch(() => null),
      ]);
      const artist = artistProfile ? mapArtistProfileToArtist(artistProfile) : undefined;
      return albums.map(a => mapCatalogAlbumToAlbum(a, artist));
    }
  );
}

export function useAlbum(albumId: string) {
  return useSWR(
    albumId ? ['album', albumId] : null,
    async () => {
      const album = await CatalogService.getFullAlbum(albumId);
      const artistMap = await fetchArtistMap();
      return mapCatalogAlbumToAlbum(album, artistMap[album.artistId]);
    }
  );
}

export async function getSongsByAlbum(albumId: string) {
  const backendAlbum = await CatalogService.getFullAlbum(albumId);
  const artistMap = await fetchArtistMap();
  const album = mapCatalogAlbumToAlbum(backendAlbum, artistMap[backendAlbum.artistId]);
  return (backendAlbum.songs || []).map((s: any) => mapCatalogSongToSong(s, album, artistMap[backendAlbum.artistId]));
}

export function useAlbumSongs(albumId: string) {
  return useSWR(
    albumId ? ['album-songs', albumId] : null,
    () => getSongsByAlbum(albumId)
  );
}

export function useArtistTopSongs(artistId: string) {
  return useSWR(
    artistId ? ['artist-top-songs', artistId] : null,
    async () => {
      const [albums, artistProfile] = await Promise.all([
        CatalogService.getArtistAlbums(artistId),
        ArtistService.getArtistProfile(artistId).catch(() => null),
      ]);
      const artist = artistProfile ? mapArtistProfileToArtist(artistProfile) : undefined;
      const allSongs: Song[] = [];
      for (const backendAlbum of albums) {
        const fullAlbum = await CatalogService.getFullAlbum(backendAlbum.albumId!);
        const album = mapCatalogAlbumToAlbum(fullAlbum, artist);
        for (const backendSong of fullAlbum.songs || []) {
          allSongs.push(mapCatalogSongToSong(backendSong, album, artist));
        }
      }
      return allSongs;
    }
  );
}

export function useSongs() {
  return useSWR(
    'all-songs',
    async () => {
      const albums = await CatalogService.getAllAlbums();
      const artistMap = await fetchArtistMap();
      const allSongs: Song[] = [];

      for (const backendAlbum of albums) {
        const album = mapCatalogAlbumToAlbum(backendAlbum, artistMap[backendAlbum.artistId]);
        for (const s of backendAlbum.songs || []) {
          allSongs.push(mapCatalogSongToSong(s, album, artistMap[backendAlbum.artistId]));
        }
      }

      return allSongs;
    },
    { revalidateOnFocus: false }
  );
}

export function usePlaylists() {
  return useSWR<Playlist[]>(
    'my-playlists',
    async () => {
      const { PlaylistService } = await import('@/api/user-library-api');
      const { CatalogService } = await import('@/api/catalog-api');
      const BackendPlaylist = await PlaylistService.getMyPlaylists();

      const allAlbums = await CatalogService.getAllAlbums(undefined, 0, 200);
      const artistMap = await fetchArtistMap();

      const allSongsMap = new Map<string, Song>();
      for (const backendAlbum of allAlbums) {
        const album = mapCatalogAlbumToAlbum(backendAlbum, artistMap[backendAlbum.artistId]);
        for (const s of backendAlbum.songs || []) {
          if (s.songId) {
            allSongsMap.set(s.songId, mapCatalogSongToSong(s, album, artistMap[backendAlbum.artistId]));
          }
        }
      }

      return Promise.all(BackendPlaylist.map(async (bp) => {
        const songs: Song[] = [];

        for (const songId of (bp.songs || []).slice(0, 50)) {
          const song = allSongsMap.get(songId);
          if (song) {
            songs.push(song);
          } else {
            try {
              const backendSong = await CatalogService.getSong(songId);
              if (backendSong) {
                let artistId = (backendSong as any).artistId;
                let albumId = (backendSong as any).albumId;
                if (backendSong.objectKey) {
                  const parts = backendSong.objectKey.split('/');
                  if (parts.length >= 3) {
                    artistId = artistId || parts[0];
                    albumId = albumId || parts[1];
                  }
                }
                const artist = artistId ? artistMap[artistId] : undefined;
                let album = undefined;
                if (albumId) {
                  try {
                    const fullAlbum = await CatalogService.getFullAlbum(albumId);
                    album = mapCatalogAlbumToAlbum(fullAlbum, artist);
                  } catch (e) {
                    console.error("Failed to fetch fallback album for song", songId);
                  }
                }
                songs.push(mapCatalogSongToSong(backendSong, album, artist));
              }
            } catch {  }
          }
        }
        return {
          id: bp.id || '',
          title: bp.title,
          description: bp.description,
          coverUrl: songs.length > 0 ? getPlaylistCoverUrl(bp.id) : '/placeholder-album.png',
          owner: {
            userId: bp.userId,
            username: bp.userId,
            role: 'USER'
          },
          songs,
          totalDuration: songs.reduce((acc, s) => acc + s.duration, 0),
          isPublic: true,
          createdAt: bp.creationDate,
          updatedAt: bp.creationDate
        } satisfies Playlist;
      }));
    },
    { revalidateOnFocus: false }
  );
}

export function usePlaylist(playlistId: string) {
  return useSWR(
    playlistId ? ['playlist', playlistId] : null,
    async () => {
      const { PlaylistService } = await import('@/api/user-library-api');
      const { CatalogService } = await import('@/api/catalog-api');
      const allPlaylists = await PlaylistService.getMyPlaylists();
      const playlist = allPlaylists.find(p => p.id === playlistId);
      if (!playlist) return null;

      const allAlbums = await CatalogService.getAllAlbums(undefined, 0, 200);
      const artistMap = await fetchArtistMap();

      const allSongsMap = new Map<string, Song>();
      for (const backendAlbum of allAlbums) {
        const album = mapCatalogAlbumToAlbum(backendAlbum, artistMap[backendAlbum.artistId]);
        for (const s of backendAlbum.songs || []) {
          if (s.songId) {
            allSongsMap.set(s.songId, mapCatalogSongToSong(s, album, artistMap[backendAlbum.artistId]));
          }
        }
      }

      const songs: Song[] = [];
      for (const songId of (playlist.songs || []).slice(0, 100)) {
        const song = allSongsMap.get(songId);
        if (song) {
          songs.push(song);
        } else {

          try {
            const backendSong = await CatalogService.getSong(songId);
            if (backendSong) {
              let artistId = (backendSong as any).artistId;
              let albumId = (backendSong as any).albumId;
              if (backendSong.objectKey) {
                const parts = backendSong.objectKey.split('/');
                if (parts.length >= 3) {
                  artistId = artistId || parts[0];
                  albumId = albumId || parts[1];
                }
              }
              const artist = artistId ? artistMap[artistId] : undefined;
              let album = undefined;
              if (albumId) {
                try {
                  const fullAlbum = await CatalogService.getFullAlbum(albumId);
                  album = mapCatalogAlbumToAlbum(fullAlbum, artist);
                } catch (e) {
                  console.error("Failed to fetch fallback album for song", songId);
                }
              }
              songs.push(mapCatalogSongToSong(backendSong, album, artist));
            }
          } catch {  }
        }
      }

      return {
        id: playlist.id || '',
        title: playlist.title,
        description: playlist.description,
        coverUrl: songs.length > 0 ? getPlaylistCoverUrl(playlist.id) : '/placeholder-album.png',
        owner: {
          userId: playlist.userId,
          username: playlist.userId,
          displayName: playlist.userId,
          avatarUrl: '/placeholder-artist.png',
          role: 'USER'
        },
        songs,
        totalDuration: songs.reduce((acc, s) => acc + s.duration, 0),
        isPublic: true,
        createdAt: playlist.creationDate,
        updatedAt: playlist.creationDate
      } as Playlist;
    }
  );
}

export function useUserPlaylists(userId: string) {
  return useSWR(
    userId ? ['user-playlist', userId] : null,
    async () => {
      const { PlaylistService } = await import('@/api/user-library-api');
      const allPlaylists = await PlaylistService.getMyPlaylists();
      return allPlaylists.map(p => ({
        id: p.id || '',
        title: p.title,
        description: p.description,
        coverUrl: p.songs.length > 0 ? getPlaylistCoverUrl(p.id) : '/placeholder-album.png',
        owner: {
          userId: p.userId,
          username: p.userId,
          role: 'USER'
        },
        songs: [],
        totalDuration: 0,
        isPublic: true,
        createdAt: p.creationDate,
        updatedAt: p.creationDate
      } satisfies Playlist));
    }
  );
}

export function useRecommendedSongs() {
  return useSWR(
    'recommended-songs',
    async () => {
      const albums = await CatalogService.getAllAlbums();
      const artistMap = await fetchArtistMap();
      const allSongs: Song[] = [];
      for (const backendAlbum of albums.slice(0, 5)) {
        const album = mapCatalogAlbumToAlbum(backendAlbum, artistMap[backendAlbum.artistId]);
        for (const s of backendAlbum.songs || []) {
          allSongs.push(mapCatalogSongToSong(s, album, artistMap[backendAlbum.artistId]));
        }
      }
      return allSongs.sort(() => Math.random() - 0.5).slice(0, 12);
    },
    { revalidateOnFocus: false }
  );
}

export function useNewRelease() {
  return useSWR(
    'new-releases',
    async () => {
      const albums = await CatalogService.getAllAlbums();
      const artistMap = await fetchArtistMap();
      const sorted = [...albums].sort(
        (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );
      return sorted.slice(0, 12).map(a => mapCatalogAlbumToAlbum(a, artistMap[a.artistId]));
    },
    {
      revalidateOnFocus: false
    }
  )
}

export function useRecommendations(userId?: string) {
  return useSWR(
    userId ? ['smart-recommendations', userId] : null,
    async () => {
      if (!userId) return [];

      try {
        const { AnalyticsService } = await import('@/api/analytics-api');
        const songIds = await AnalyticsService.getRecommendations(userId, 12);

        const albums = await CatalogService.getAllAlbums(undefined, 0, 500);
        const artistMap = await fetchArtistMap();

        const allSongs: Song[] = [];
        for (const backendAlbum of albums) {
          const album = mapCatalogAlbumToAlbum(backendAlbum, artistMap[backendAlbum.artistId]);
          for (const s of backendAlbum.songs || []) {
            allSongs.push(mapCatalogSongToSong(s, album, artistMap[backendAlbum.artistId]));
          }
        }

        const recommendedSongs = songIds
          .map(id => allSongs.find(s => s.id === id))
          .filter(Boolean) as Song[];

        return recommendedSongs;
      } catch (e) {
        console.error("Failed to get smart recommendations", e);
        return [];
      }
    },
    { revalidateOnFocus: false }
  );
}

export function useArtistFollowerCount(artistId: string, followedArtists: string[]) {
  const isFollowed = followedArtists.includes(artistId);
  return useSWR(
    artistId ? ['artist-follower-count', artistId, isFollowed] : null,
    async () => {
      const { LibraryService } = await import('@/api/user-library-api');
      return LibraryService.getArtistFollowerCount(artistId);
    },
    { revalidateOnFocus: false }
  );
}

export function useTopArtist(userId?: string) {
  return useSWR(
    userId ? ['top-artist', userId] : null,
    async () => {
      try {
        const { AnalyticsService } = await import('@/api/analytics-api');
        const topArtists = await AnalyticsService.getTopArtists(userId!, 1);
        console.log("Fetched topArtists:", topArtists);
        if (!topArtists || topArtists.length === 0) return null;
        const artistId = topArtists[0].id;

        const artistMap = await fetchArtistMap();
        if (artistMap[artistId]) return artistMap[artistId];

        console.log("Artist not in map, fetching from profile:", artistId);
        const { ArtistService } = await import('@/api/artist-api');
        const p = await ArtistService.getArtistProfile(artistId);
        console.log("Fetched profile:", p);
        return mapArtistProfileToArtist(p);
      } catch (e) {
        console.error("useTopArtist error: ", e);
        return null;
      }
    },
    { revalidateOnFocus: false }
  );
}

export function useRecommendedArtistsAndAlbums(topArtist: Artist | null) {
  return useSWR(
    topArtist ? ['recommended-artists-albums', topArtist.id] : null,
    async () => {
      try {
        const { ArtistService } = await import('@/api/artist-api');
        const { CatalogService } = await import('@/api/catalog-api');

        const allArtistsProfiles = await ArtistService.getAllArtists();
        const allAlbums = await CatalogService.getAllAlbums(undefined, 0, 500);

        const genre = topArtist?.genres?.[0];
        const artistMap = await fetchArtistMap();

        const recArtists = allArtistsProfiles
          .filter(a => a.userId !== topArtist!.id && (genre ? a.genre === genre : true))
          .map(mapArtistProfileToArtist)
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);

        const recAlbums = allAlbums
          .filter(a => a.artistId !== topArtist!.id && (genre ? a.genre === genre : true))
          .map(a => mapCatalogAlbumToAlbum(a, artistMap[a.artistId]))
          .sort(() => Math.random() - 0.5)
          .slice(0, 6);

        return { recArtists, recAlbums };
      } catch (e) {
        return { recArtists: [], recAlbums: [] };
      }
    },
    { revalidateOnFocus: false }
  );
}

