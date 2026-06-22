import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from './glass-card';
import { usePlayerStore } from '../lib/store';
import { getSongsByAlbum } from '@/lib/api';
import type { Album } from '../types/music';
import { getAlbumCoverUrl } from '@/lib/utils';
import { get } from 'http';

interface AlbumCardProps {
  album: Album;
  variant?: 'grid' | 'featured' | 'compact';
}

export function AlbumCard({ album, variant = 'grid' }: AlbumCardProps) {
  const { setCurrentSong, setQueue, play } = usePlayerStore();

  const handlePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const songs = await getSongsByAlbum(album.id);
      if (songs.length > 0) {
        setQueue(songs);
        setCurrentSong(songs[0]);
        play();
      }
    } catch (err) {
      console.error("Failed to load album songs", err);
    }
  };

  if (variant === 'featured') {
    return (
      <Link to={`/album/${album.id}`}>
        <GlassCard variant="card" className="group relative overflow-hidden aspect-[2/1] min-w-[300px]">
          <img
            src={getAlbumCoverUrl(album.id)}
            alt={album.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <span className="text-xs uppercase tracking-wider text-primary mb-1">
              {album.type === 'album' ? 'Album' : album.type.toUpperCase()}
            </span>
            <h3 className="text-xl font-bold mb-1">{album.title}</h3>
            <p className="text-sm text-muted-foreground">{album.artist.name}</p>
          </div>
          <motion.button
            onClick={handlePlay}
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all glow-primary"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 10, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
          >
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
          </motion.button>
        </GlassCard>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/album/${album.id}`}>
        <motion.div
          className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
          whileHover={{ x: 2 }}
        >
          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <img src={getAlbumCoverUrl(album.id)} alt={album.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-4 h-4 ml-0.5" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{album.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {album.type === 'album' ? 'Album' : album.type.toUpperCase()} • {album.artist.name}
            </p>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/album/${album.id}`}>
      <GlassCard variant="card" hover className="group p-3">
        <div className="relative aspect-square mb-3 rounded-lg overflow-hidden">
          <img
            src={getAlbumCoverUrl(album.id)}
            alt={album.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <motion.button
            onClick={handlePlay}
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 glow-primary"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
          </motion.button>
        </div>
        <h3 className="font-medium truncate text-sm">{album.title}</h3>
        <p className="text-xs text-muted-foreground truncate">
          {new Date(album.releaseDate).getFullYear()} • {album.artist.name}
        </p>
      </GlassCard>
    </Link>
  );
}