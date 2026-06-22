"use client";

import { MediaCard, MediaCardCompact } from "../components/media-card";
import { ChevronRight, Loader2 } from "lucide-react";
import { useUserStore } from "../lib/store";
import {
  useRecommendedSongs,
  useNewRelease,
  useArtists,
  useUserPlaylists,
  usePlaylists,
} from "../lib/api";

import { cn } from "../lib/utils";
import { Navigate } from "react-router";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  addedAt?: string;
}

interface Playlist {
  id: string;
  name: string;
  coverUrl: string;
  type: "playlist" | "album" | "artist";
  description?: string;
}

interface WelcomePageProps {
  recentlyPlayed: Playlist[];
  topHits: Track[];
  featuredPlaylists: Playlist[];
  newReleases: Track[];
  onPlayTrack: (trackIndex: number, tracks: Track[]) => void;
  onPlayPlaylist: (playlistId: string) => void;
  currentTrackId?: string;
  isPlaying?: boolean;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

interface SectionHeaderProps {
  title: string;
  showAll?: boolean;
  onShowAll?: () => void;
}

function SectionHeader({ title, showAll, onShowAll }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      {showAll && (
        <button
          onClick={onShowAll}
          className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Show all
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function WelcomePage() {

  const user = useUserStore((state) => state.user);
  const recentlyPlayed = useUserStore((state) => state.recentlyPlayed);

  const { data: topHits = [], isLoading: loadingHits } = useRecommendedSongs();
  const { data: newReleases = [] } = useNewRelease();
  const { data: artists = [] } = useArtists();
  const { data: allPlaylists = [] } = usePlaylists();

  const { data: userPlaylists = [] } = useUserPlaylists(user?.userId || "");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loadingHits) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-8 relative">

      <div className="relative -mx-6 -mt-6 px-6 pt-16 pb-8">
        <h1 className="text-4xl font-bold relative z-10">
          {getGreeting()}, <span className="text-primary">{user.name || user.username}</span>
        </h1>
      </div>

      {recentlyPlayed.length > 0 && (
        <section className="-mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            {recentlyPlayed.slice(0, 8).map((song) => (
              <MediaCardCompact
                key={song.id}
                id={song.id}
                title={song.title}
                coverUrl={song.coverUrl}
                isPlaying={false}
                onPlay={() => console.log("Play song", song.id)}
                onClick={() => console.log("Navigate to song", song.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Recommended For You" showAll />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {topHits.slice(0, 6).map((track) => (
            <MediaCard
              key={track.id}
              id={track.id}
              title={track.title}
              subtitle={track.artist.name}
              coverUrl={track.coverUrl}
              type="song"
              onPlay={() => console.log("Play track", track.id)}
              onClick={() => console.log("Navigate to track", track.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Featured Playlists" showAll />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {allPlaylists.slice(0, 6).map((playlist) => (
            <MediaCard
              key={playlist.id}
              id={playlist.id}
              title={playlist.title}
              subtitle={playlist.description || "Playlist"}
              coverUrl={playlist.coverUrl}
              type="playlist"
              onPlay={() => console.log("Play playlist", playlist.id)}
              onClick={() => console.log("Navigate to playlist", playlist.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="New Releases" showAll />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {newReleases.slice(0, 6).map((album) => (
            <MediaCard
              key={album.id}
              id={album.id}
              title={album.title}
              subtitle={album.artist.name}
              coverUrl={album.coverUrl}
              type="album"
              onPlay={() => console.log("Play album", album.id)}
              onClick={() => console.log("Navigate to album", album.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Popular Artists" showAll />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {artists.slice(0, 6).map((artist) => (
            <MediaCard
              key={artist.id}
              id={artist.id}
              title={artist.name}
              subtitle="Artist"
              coverUrl={artist.imageUrl}
              type="artist"
              onPlay={() => { }}
              onClick={() => { }}
            />
          ))}
        </div>
      </section>

      {}
    </div>
  );
}