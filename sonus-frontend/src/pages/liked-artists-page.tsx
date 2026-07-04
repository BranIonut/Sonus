import { motion } from 'framer-motion';
import { Heart, Play, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/glass-card';
import { ArtistCard } from '@/components/artist-card';
import { useUserStore, usePlayerStore } from '@/lib/store';
import { useArtists } from '@/lib/api';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LikedArtistsPage() {
  const { followedArtists } = useUserStore();
  const { data: allArtists } = useArtists();

  const artists =
    allArtists?.filter((a) => followedArtists.includes(a.id)) ?? [];

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

      <motion.div variants={itemVariants}>
        <GlassCard variant="card" className="relative overflow-hidden p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent" />
          <div className="relative z-10 flex items-end gap-6">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl glow-primary flex-shrink-0">
              <Heart className="w-16 h-16 md:w-24 md:h-24 text-white fill-white" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Collection
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-2">
                Liked Artists
              </h1>
              <p className="text-muted-foreground">
                {artists.length} {artists.length === 1 ? 'artist' : 'artists'}
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.section variants={itemVariants}>
        {artists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {artists.map((artist) => (
              <motion.div key={artist.id} variants={itemVariants}>
                <ArtistCard artist={artist} />
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard variant="card" className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No liked artists yet</h3>
            <p className="text-muted-foreground mb-6">
              Follow artists by tapping the heart on their page
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
