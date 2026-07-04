import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import type { Song, PlayerState, User } from '../types/music';

interface PlayerStore extends PlayerState {
  history: Song[];
  userQueue: Song[];

  setCurrentSong: (song: Song | null) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setQueue: (songs: Song[]) => void;
  reorderUserQueue: (newOrder: Song[]) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      currentSong: null,
      queue: [],
      userQueue: [],
      history: [],
      isPlaying: false,
      volume: 0.7,
      progress: 0,
      duration: 0,
      shuffle: false,
      repeat: 'off',

      setCurrentSong: (song) => {
        const { isAuthenticated, user } = useUserStore.getState();
        if (song !== null && !isAuthenticated) {
          toast.error('You must be logged in to play this track', {
            description: 'Please sign in to enjoy Sonus.',
            style: {
              background: '#dc2626',
              color: '#fff',
              border: '1px solid #b91c1c',
            },
          });
          return;
        }
        if (song !== null && isAuthenticated && !user?.hasActiveSubscription) {
          toast.error('Premium subscription required', {
            description: 'Upgrade your current streaming plan to play this track.',
            duration: 4000,
            style: {
              background: '#7c3aed',
              color: '#fff',
              border: '1px solid #6d28d9',
            },
          });
          return;
        }
        set((state) => ({
          currentSong: song,
          progress: 0,
          history: song && state.currentSong ? [...state.history, state.currentSong].slice(-50) : state.history
        }));
      },

      play: () => set({ isPlaying: true }),

      pause: () => set({ isPlaying: false }),

      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

      setProgress: (progress) => set({ progress }),

      setDuration: (duration) => set({ duration }),

      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle, history: [] })),

      cycleRepeat: () => set((state) => {
        const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(state.repeat);
        return { repeat: modes[(currentIndex + 1) % modes.length] };
      }),

      addToQueue: (song) => {
        set((state) => ({
          userQueue: [...state.userQueue, song]
        }));
        toast.success('Added to Queue', {
          description: `${song.title} will play next.`
        });
      },

      removeFromQueue: (songId) => set((state) => ({
        userQueue: state.userQueue.filter((s) => s.id !== songId),
        queue: state.queue.filter((s) => s.id !== songId)
      })),

      clearQueue: () => set({ queue: [], history: [], userQueue: [] }),

      setQueue: (songs) => set({ queue: songs, history: [], userQueue: [] }),

      reorderUserQueue: (newOrder) => set({ userQueue: newOrder }),

      playNext: () => {
        const { queue, userQueue, currentSong, shuffle, repeat, history } = get();
        
        if (userQueue.length > 0) {
          const nextSong = userQueue[0];
          set((state) => ({
            userQueue: state.userQueue.slice(1),
            currentSong: nextSong,
            progress: 0,
            history: currentSong ? [...state.history, currentSong].slice(-50) : state.history
          }));
          return;
        }

        if (queue.length === 0) {
          if (repeat === 'one' || repeat === 'all') {
            set({ progress: 0 });
          }
          return;
        }

        const currentIndex = currentSong
          ? queue.findIndex((s) => s.id === currentSong.id)
          : -1;

        let nextIndex: number;
        if (shuffle) {
          const playedIds = new Set(history.map(s => s.id));
          if (currentSong) playedIds.add(currentSong.id);
          
          let unplayedIndices = queue.map((_, i) => i).filter(i => !playedIds.has(queue[i].id));
          
          if (unplayedIndices.length === 0) {
            if (repeat === 'all') {
              set({ history: [] }); 
              unplayedIndices = queue.map((_, i) => i).filter(i => currentSong ? queue[i].id !== currentSong.id : true);
              if (unplayedIndices.length === 0) unplayedIndices = [0]; 
            } else {
              set({ isPlaying: false, progress: 0 });
              return;
            }
          }
          nextIndex = unplayedIndices[Math.floor(Math.random() * unplayedIndices.length)];
        } else {
          nextIndex = currentIndex + 1;
          if (nextIndex >= queue.length) {
            if (repeat === 'all') {
              nextIndex = 0;
            } else {
              set({ isPlaying: false, progress: 0 });
              return;
            }
          }
        }

        const nextSong = queue[nextIndex];
        set((state) => ({
          currentSong: nextSong,
          progress: 0,
          history: currentSong ? [...state.history, currentSong].slice(-50) : state.history
        }));
      },

      playPrevious: () => {
        const { queue, currentSong, progress, history, shuffle } = get();

        if (progress > 3) {
          set({ progress: 0 });
          return;
        }

        if (queue.length === 0) return;

        if (shuffle && history.length > 0) {
          const prevSong = history[history.length - 1];
          set({
            currentSong: prevSong,
            progress: 0,
            history: history.slice(0, -1)
          });
          return;
        }

        const currentIndex = currentSong
          ? queue.findIndex((s) => s.id === currentSong.id)
          : 0;

        if (currentIndex === -1 && history.length > 0) {
          const prevSong = history[history.length - 1];
          set({
            currentSong: prevSong,
            progress: 0,
            history: history.slice(0, -1)
          });
          return;
        }

        const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
        const prevSong = queue[prevIndex];
        set((state) => ({
          currentSong: prevSong,
          progress: 0,
          history: currentSong ? [...state.history, currentSong].slice(-50) : state.history
        }));
      },
    }),
    {
      name: 'sonus-player',
      partialize: (state) => ({
        volume: state.volume,
        shuffle: state.shuffle,
        repeat: state.repeat,
      }),
    }
  )
);

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  likedSongs: string[];
  savedAlbums: string[];
  followedArtists: string[];
  recentlyPlayed: Song[];

  setUser: (user: User | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;

  loadLibrary: () => Promise<void>;
  toggleLike: (songId: string) => void;
  toggleSaveAlbum: (albumId: string) => void;
  toggleFollowArtist: (artistId: string) => void;
  addToRecentlyPlayed: (song: Song) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      likedSongs: [],
      savedAlbums: [],
      followedArtists: [],
      recentlyPlayed: [],

      setUser: (user) => set({
        user,
        isAuthenticated: !!user
      }),

      loadLibrary: async () => {
        try {
          const { LibraryService } = await import('../api/user-library-api');
          const library = await LibraryService.getMyLibrary();
          set({
            likedSongs: library.likedSongs || [],
            savedAlbums: library.savedAlbums || [],
            followedArtists: library.followedArtists || [],
          });
        } catch (err) {
          console.error('Failed to load library from backend:', err);
        }
      },

      toggleLike: (songId) => {
        const prev = get().likedSongs;
        const isLiking = !prev.includes(songId);

        set((state) => ({
          likedSongs: isLiking
            ? [...state.likedSongs, songId]
            : state.likedSongs.filter((id) => id !== songId)
        }));

        toast.success(isLiking ? 'Added to Liked Songs' : 'Removed from Liked Songs');
        import('../api/user-library-api').then(({ LibraryService }) => {
          LibraryService.toggleLikeSong(songId).catch((err) => {
            console.error('Failed to sync song like:', err);
            set({ likedSongs: prev }); 
          });
        });
      },

      toggleSaveAlbum: (albumId) => {
        const prev = get().savedAlbums;
        const isSaving = !prev.includes(albumId);

        set((state) => ({
          savedAlbums: isSaving
            ? [...state.savedAlbums, albumId]
            : state.savedAlbums.filter((id) => id !== albumId)
        }));

        toast.success(isSaving ? 'Album saved to Library' : 'Album removed from Library');
        import('../api/user-library-api').then(({ LibraryService }) => {
          LibraryService.toggleSaveAlbum(albumId).catch((err) => {
            console.error('Failed to sync album save:', err);
            set({ savedAlbums: prev }); 
          });
        });
      },

      toggleFollowArtist: (artistId) => {
        const prev = get().followedArtists;
        const isFollowing = !prev.includes(artistId);

        set((state) => ({
          followedArtists: isFollowing
            ? [...state.followedArtists, artistId]
            : state.followedArtists.filter((id) => id !== artistId)
        }));

        toast.success(isFollowing ? 'Artist followed' : 'Artist unfollowed');
        import('../api/user-library-api').then(({ LibraryService }) => {
          LibraryService.toggleFollowArtist(artistId).catch((err) => {
            console.error('Failed to sync artist follow:', err);
            set({ followedArtists: prev }); 
          });
        });
        
        import('../api/artist-api').then(({ ArtistService }) => {
           if (isFollowing) {
               ArtistService.incrementFollowers(artistId).catch(console.error);
           } else {
               ArtistService.decrementFollowers(artistId).catch(console.error);
           }
        });
        
        import('swr').then(({ mutate }) => {
            mutate(['artist', artistId]);
            mutate('artists');
        });
      },

      addToRecentlyPlayed: (song) => set((state) => {
        const filtered = state.recentlyPlayed.filter((s) => s.id !== song.id);
        return {
          recentlyPlayed: [song, ...filtered].slice(0, 50)
        };
      }),

      login: (user, token) => {
        localStorage.setItem('authToken', token);
        set({ user, isAuthenticated: true });

        setTimeout(() => get().loadLibrary(), 0);
      },

      logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        usePlayerStore.setState({
          currentSong: null,
          queue: [],
          isPlaying: false,
          progress: 0
        });
        set({
          user: null,
          isAuthenticated: false,
          likedSongs: [],
          savedAlbums: [],
          followedArtists: [],
          recentlyPlayed: [],
        });

        import('../router').then(({ navigate }) => navigate('/login'));
      },
    }),
    {
      name: 'sonus-user',
    }
  )
);

interface UIStore {
  sidebarOpen: boolean;
  playerExpanded: boolean;
  searchQuery: string;
  activeView: string;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setPlayerExpanded: (expanded: boolean) => void;
  togglePlayerExpanded: () => void;
  setSearchQuery: (query: string) => void;
  setActiveView: (view: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  playerExpanded: false,
  searchQuery: '',
  activeView: 'home',

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setPlayerExpanded: (expanded) => set({ playerExpanded: expanded }),
  togglePlayerExpanded: () => set((state) => ({ playerExpanded: !state.playerExpanded })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveView: (view) => set({ activeView: view }),
}));