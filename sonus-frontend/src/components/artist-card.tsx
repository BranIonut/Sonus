import { motion } from 'framer-motion';
import { Play, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from './glass-card';
import { formatNumber, getArtistImageUrl, getUserAvatar, getFallbackAvatarUrl } from '../lib/utils';
import type { Artist } from '../types/music';

interface ArtistCardProps {
  artist: Artist;
  variant?: 'grid' | 'featured' | 'compact';
}

export function ArtistCard({ artist, variant = 'grid' }: ArtistCardProps) {
  if (variant === 'featured') {
    return (
      <Link to={`/artist/${artist.id}`}>
        <GlassCard variant="card" className="group relative overflow-hidden aspect-[2/1]">
          <img
            src={getUserAvatar(artist.id)}
            alt={artist.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackAvatarUrl(); }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider text-primary">Artist</span>
              {artist.verified && (
                <BadgeCheck className="w-4 h-4 text-primary" />
              )}
            </div>
            <h3 className="text-2xl font-bold mb-1">{artist.name}</h3>
            {artist.monthlyListeners && (
              <p className="text-sm text-muted-foreground">
                {formatNumber(artist.monthlyListeners)} monthly listeners
              </p>
            )}
          </div>
          <motion.button
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all glow-primary"
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
      <Link to={`/artist/${artist.id}`}>
        <motion.div 
          className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
          whileHover={{ x: 2 }}
        >
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <img src={getArtistImageUrl(artist.id)} alt={artist.name} className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium truncate">{artist.name}</p>
              {artist.verified && (
                <BadgeCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">Artist</p>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/artist/${artist.id}`}>
      <GlassCard variant="card" hover className="group p-3 text-center">
        <div className="relative aspect-square mb-3 rounded-full overflow-hidden mx-auto w-full max-w-[160px]">
          <img
            src={getUserAvatar(artist.id)}
            alt={artist.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackAvatarUrl(); }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center glow-primary">
              <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
            </div>
          </motion.div>
        </div>
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <h3 className="font-medium truncate text-sm">{artist.name}</h3>
          {artist.verified && (
            <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">Artist</p>
      </GlassCard>
    </Link>
  );
}