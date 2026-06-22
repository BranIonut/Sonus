import { motion } from 'framer-motion';
import { Play, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from './glass-card';
import { usePlayerStore } from '../lib/store';
import { formatDuration, formatNumber } from '@/lib/utils';
import type { Playlist } from '../types/music';
import { getAlbumCoverUrl, getPlaylistCoverUrl } from '../lib/utils';

interface PlaylistCardProps {
  playlist: Playlist;
  variant?: 'grid' | 'featured' | 'compact' | 'large';
}

export function PlaylistCard({ playlist, variant = 'grid' }: PlaylistCardProps) {
  const { setCurrentSong, setQueue, play } = usePlayerStore();

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (playlist.songs.length > 0) {
      setQueue(playlist.songs);
      setCurrentSong(playlist.songs[0]);
      play();
    }
  };

  const totalDurationFormatted = () => {
    const hours = Math.floor(playlist.totalDuration / 3600);
    const mins = Math.floor((playlist.totalDuration % 3600) / 60);
    if (hours > 0) {
      return `${hours} hr ${mins} min`;
    }
    return `${mins} min`;
  };

  if (variant === 'featured') {
    return (
      <Link to={`/playlist/${playlist.id}`}>
        <GlassCard variant="card" className="group relative overflow-hidden aspect-[3/2]">
          <img
            src={playlist.coverUrl}
            alt={playlist.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <span className="text-xs uppercase tracking-wider text-accent mb-1">Playlist</span>
            <h3 className="text-2xl font-bold mb-1">{playlist.title}</h3>
            {playlist.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{playlist.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{playlist.songs.length} songs</span>
              <span>•</span>
              <span>{totalDurationFormatted()}</span>
              {playlist.followers && playlist.followers > 0 && (
                <>
                  <span>•</span>
                  <span>{formatNumber(playlist.followers)} followers</span>
                </>
              )}
            </div>
          </div>
          <motion.button
            onClick={handlePlay}
            className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all glow-primary"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
          </motion.button>
        </GlassCard>
      </Link>
    );
  }

  if (variant === 'large') {
    return (
      <Link to={`/playlist/${playlist.id}`}>
        <GlassCard variant="card" className="group p-4 flex gap-4">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={getPlaylistCoverUrl(playlist.id)}
              alt={playlist.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-8 h-8 ml-0.5" />
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Playlist</span>
            <h3 className="text-lg font-bold truncate">{playlist.title}</h3>
            {playlist.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{playlist.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <span>{playlist.songs.length} songs</span>
              <span>•</span>
              <span>{totalDurationFormatted()}</span>
            </div>
          </div>
          <motion.button
            onClick={handlePlay}
            className="self-center w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all glow-primary"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
          </motion.button>
        </GlassCard>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/playlist/${playlist.id}`}>
        <motion.div
          className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
          whileHover={{ x: 2 }}
        >
          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-secondary flex items-center justify-center">
            {playlist.coverUrl ? (
              <img src={getPlaylistCoverUrl(playlist.id)} alt={playlist.title} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <Music className="w-5 h-5 text-muted-foreground" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-4 h-4 ml-0.5" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{playlist.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              Playlist • {playlist.songs.length} songs
            </p>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/playlist/${playlist.id}`}>
      <GlassCard variant="card" hover className="group p-3">
        <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
          {playlist.coverUrl ? (
            <img
              src={getPlaylistCoverUrl(playlist.id)}
              alt={playlist.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Music className="w-12 h-12 text-muted-foreground" />
          )}
          <motion.button
            onClick={handlePlay}
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 glow-primary"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
          </motion.button>
        </div>
        <h3 className="font-medium truncate text-sm">{playlist.title}</h3>
        <p className="text-xs text-muted-foreground truncate">
          {playlist.songs.length} songs • {totalDurationFormatted()}
        </p>
      </GlassCard>
    </Link>
  );
}