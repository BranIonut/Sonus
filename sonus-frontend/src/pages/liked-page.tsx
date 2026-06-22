'use client';

import { motion } from 'framer-motion';
import { Heart, Play, Shuffle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/glass-card';
import { SongCard } from '@/components/song-card';
import { useUserStore, usePlayerStore } from '@/lib/store';
import { useSongs } from '@/lib/api';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LikedSongsPage() {
  const { likedSongs } = useUserStore();
  const { data: allSongs } = useSongs();
  const { setCurrentSong, setQueue, play } = usePlayerStore();

  const songs = allSongs?.filter((song) => likedSongs.includes(song.id)) || [];

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs);
      setCurrentSong(songs[0]);
      play();
    }
  };

  const handleShuffle = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      setCurrentSong(shuffled[0]);
      play();
    }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

      <motion.div variants={itemVariants}>
        <GlassCard variant="card" className="relative overflow-hidden p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-primary/20 to-transparent" />
          <div className="relative z-10 flex items-end gap-6">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-2xl glow-accent">
              <Heart className="w-16 h-16 md:w-24 md:h-24 text-white fill-white" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Playlist
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-2">Liked Songs</h1>
              <p className="text-muted-foreground">
                {songs.length} {songs.length === 1 ? 'song' : 'songs'}
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <Button
          size="lg"
          className="rounded-full glow-primary"
          onClick={handlePlayAll}
          disabled={songs.length === 0}
        >
          <Play className="w-5 h-5 mr-2 ml-0.5" />
          Play
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full glass"
          onClick={handleShuffle}
          disabled={songs.length === 0}
        >
          <Shuffle className="w-5 h-5 mr-2" />
          Shuffle
        </Button>
      </motion.div>

      <motion.section variants={itemVariants}>
        {songs.length > 0 ? (
          <GlassCard variant="card" className="p-2">

            <div className="flex items-center gap-4 px-4 py-2 text-xs text-muted-foreground border-b border-border/50 mb-2">
              <span className="w-8 text-center">#</span>
              <span className="flex-1">Title</span>
              <span className="hidden md:block w-[200px]">Album</span>
              <span className="w-20" />
              <span className="w-12 text-right">
                <Clock className="w-4 h-4 inline" />
              </span>
              <span className="w-10" />
            </div>

            {songs.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
                onPlay={() => {
                  setQueue(songs);
                  setCurrentSong(song);
                  play();
                }}
              />
            ))}
          </GlassCard>
        ) : (
          <GlassCard variant="card" className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No liked songs yet</h3>
            <p className="text-muted-foreground mb-6">
              Start liking songs by tapping the heart icon
            </p>
            <Button variant="outline" className="glass" asChild>
              <Link to="/explore">Explore Music</Link>
            </Button>
          </GlassCard>
        )}
      </motion.section>
    </motion.div>
  );
}