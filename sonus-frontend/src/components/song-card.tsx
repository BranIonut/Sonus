import { motion } from 'framer-motion';
import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, getAlbumCoverUrl } from '../lib/utils';
import { GlassCard } from './glass-card';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { usePlayerStore, useUserStore } from '../lib/store';
import { formatDuration } from '@/lib/utils';
import type { Song } from '../types/music';
import { AddToPlaylistDialog } from './add-to-playlist-dialog';
import { useState } from 'react';

interface SongCardProps {
  song: Song;
  index?: number;
  showAlbum?: boolean;
  showArtist?: boolean;
  variant?: 'grid' | 'list' | 'compact';
  onPlay?: () => void;
  onRemoveFromPlaylist?: (songId: string) => void;
}

export function SongCard({
  song,
  index,
  showAlbum = true,
  showArtist = true,
  variant = 'list',
  onPlay,
  onRemoveFromPlaylist
}: SongCardProps) {
  const { currentSong, isPlaying, setCurrentSong, togglePlay, addToQueue } = usePlayerStore();
  const { likedSongs, toggleLike } = useUserStore();
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);

  const isCurrentSong = currentSong?.id === song.id;
  const isLiked = likedSongs.includes(song.id);

  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    } else if (isCurrentSong) {
      togglePlay();
    } else {
      setCurrentSong(song);
    }
  };

  if (variant === 'grid') {
    return (
      <GlassCard variant="card" hover className="group p-3">
        <div className="relative aspect-square mb-3 rounded-lg overflow-hidden">
          <img
            src={getAlbumCoverUrl(song.album?.id || song.coverUrl)}
            alt={song.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <motion.button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center glow-primary">
              {isCurrentSong && isPlaying ? (
                <Pause className="w-5 h-5 text-primary-foreground" />
              ) : (
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
              )}
            </div>
          </motion.button>
          {song.explicit && (
            <span className="absolute bottom-2 left-2 px-1.5 py-0.5 text-[10px] font-medium bg-white/20 backdrop-blur-sm rounded">
              E
            </span>
          )}
        </div>
        <h3 className="font-medium truncate text-sm">{song.title}</h3>
        {showArtist && (
          <Link
            to={`/artist/${song.artist.id}`}
            className="text-xs text-muted-foreground hover:text-foreground truncate block"
          >
            {song.artist.name}
          </Link>
        )}
      </GlassCard>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn(
          'group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer',
          isCurrentSong && 'bg-white/10'
        )}
        onClick={handlePlay}
        whileHover={{ x: 2 }}
      >
        <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
          <img src={getAlbumCoverUrl(song.album?.id || song.coverUrl)} alt={song.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity',
            isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}>
            {isCurrentSong && isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm truncate', isCurrentSong && 'text-primary')}>{song.title}</p>
          <p className="text-xs text-muted-foreground truncate">{song.artist.name}</p>
        </div>
        <span className="text-xs text-muted-foreground">{formatDuration(song.duration)}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        'group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors',
        isCurrentSong && 'bg-white/10'
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
    >

      <div className="w-8 flex items-center justify-center">
        {index !== undefined ? (
          <span className={cn(
            'text-sm text-muted-foreground group-hover:hidden',
            isCurrentSong && 'text-primary'
          )}>
            {index + 1}
          </span>
        ) : null}
        <button
          onClick={handlePlay}
          className={cn(
            'hidden group-hover:flex items-center justify-center',
            index === undefined && 'flex'
          )}
        >
          {isCurrentSong && isPlaying ? (
            <Pause className="w-4 h-4 text-primary" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>
      </div>

      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
        <img src={getAlbumCoverUrl(song.album?.id || song.coverUrl)} alt={song.title} className="absolute inset-0 w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('font-medium truncate', isCurrentSong && 'text-primary')}>
          {song.title}
          {song.explicit && (
            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-white/20 rounded">E</span>
          )}
        </p>
        {showArtist && (
          <Link
            to={`/artist/${song.artist.id}`}
            className="text-sm text-muted-foreground hover:text-foreground truncate block"
            onClick={(e) => e.stopPropagation()}
          >
            {song.artist.name}
          </Link>
        )}
      </div>

      {showAlbum && song.album && (
        <Link
          to={`/album/${song.album.id}`}
          className="hidden md:block text-sm text-muted-foreground hover:text-foreground truncate max-w-[200px]"
          onClick={(e) => e.stopPropagation()}
        >
          {song.album.title}
        </Link>
      )}

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'opacity-0 group-hover:opacity-100 transition-opacity',
          isLiked && 'opacity-100 text-accent'
        )}
        onClick={(e) => {
          e.stopPropagation();
          toggleLike(song.id);
        }}
      >
        <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
      </Button>

      <span className="text-sm text-muted-foreground w-12 text-right">
        {formatDuration(song.duration)}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-heavy">
          <DropdownMenuItem onClick={() => addToQueue(song)}>
            Add to Queue
          </DropdownMenuItem>
          {onRemoveFromPlaylist && (
            <DropdownMenuItem
              className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
              onSelect={(e) => {
                e.preventDefault();
                onRemoveFromPlaylist(song.id);
              }}
            >
              Remove from Playlist
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault();
            setIsPlaylistDialogOpen(true);
          }}>Add to Playlist</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link to={`/artist/${song.artist.id}`}>Go to Artist</Link>
          </DropdownMenuItem>
          {song.album && (
            <DropdownMenuItem>
              <Link to={`/album/${song.album.id}`}>Go to Album</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem>Share</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddToPlaylistDialog
        isOpen={isPlaylistDialogOpen}
        onClose={() => setIsPlaylistDialogOpen(false)}
        songId={song.id}
      />
    </motion.div>
  );
}