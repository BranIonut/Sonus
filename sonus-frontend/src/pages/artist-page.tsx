import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Shuffle, UserPlus, UserCheck, Share2, BadgeCheck, Users, Upload, ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/glass-card';
import { SongCard } from '@/components/song-card';
import { AlbumCard } from '@/components/album-card';
import { SectionHeader } from '@/components/section-header';
import { useArtist, useArtistAlbums, useArtistTopSongs, useArtistFollowerCount } from '@/lib/api';
import { usePlayerStore, useUserStore } from '@/lib/store';
import { formatNumber, getUserAvatar, getFallbackAvatarUrl } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

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

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: artist, error: artistError, isLoading: isArtistLoading } = useArtist(id || '');
  const { data: albums } = useArtistAlbums(id || '');
  const { data: topSongs } = useArtistTopSongs(id || '');
  const { setCurrentSong, setQueue, play } = usePlayerStore();
  const currentUser = useUserStore((state) => state.user);
  const { followedArtists, toggleFollowArtist } = useUserStore();
  const { data: followerCount } = useArtistFollowerCount(id || '', followedArtists);
  const [visibleSongsCount, setVisibleSongsCount] = useState(5);

  const isFollowing = id ? followedArtists.includes(id) : false;
  const isOwnProfile = currentUser?.userId === id;

  if (artistError || (!isArtistLoading && !artist)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 fade-in">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Users className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Artist not found</h2>
        <p className="text-muted-foreground max-w-md text-center">
          Unfortunately, this artist profile is no longer available or has been deleted.
        </p>
        <Button variant="outline" className="mt-8 glass rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  if (isArtistLoading || !artist) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handlePlayAll = () => {
    if (topSongs && topSongs.length > 0) {
      setQueue(topSongs);
      setCurrentSong(topSongs[0]);
      play();
    }
  };

  const handleShuffle = () => {
    if (topSongs && topSongs.length > 0) {
      const shuffled = [...topSongs].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      setCurrentSong(shuffled[0]);
      play();
    }
  };

  const handleFollowToggle = () => {
    if (!id) return;
    toggleFollowArtist(id);
    toast.success(isFollowing ? `Unfollowed ${artist.name}` : `Now following ${artist.name}`);
  };

  const handleShare = () => {
    window.navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success('Link copied to clipboard!'));
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

      <motion.div variants={itemVariants} className="relative">
        <GlassCard variant="card" className="relative overflow-hidden">

          <div className="absolute inset-0">
            <img
              src={getUserAvatar(artist.id || '')}
              alt=""
              className="w-full h-full object-cover blur-2xl opacity-30 scale-110"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackAvatarUrl(); }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>

          <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-end gap-6">

            <motion.div
              className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden shadow-2xl flex-shrink-0 ring-4 ring-primary/20"
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={getUserAvatar(artist.id || '')}
                alt={artist.name}
                width={224}
                height={224}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackAvatarUrl(); }}
              />
            </motion.div>

            <div className="flex-1">
              {artist.verified && (
                <div className="flex items-center gap-1 text-xs text-primary mb-2">
                  <BadgeCheck className="w-4 h-4" />
                  Verified Artist
                </div>
              )}
              <h1 className="text-4xl md:text-6xl font-bold mb-3">{artist.name}</h1>

              <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                <Users className="w-4 h-4" />
                <span className="font-semibold text-foreground">
                  {followerCount !== undefined ? formatNumber(followerCount) : '—'}
                </span>
                <span>followers</span>
              </div>

              {artist.genres && artist.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {artist.genres.map((genre) => (
                    <span key={genre} className="px-3 py-1 text-xs rounded-full glass">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-3 flex-wrap">
        <Button size="lg" className="rounded-full" onClick={handlePlayAll}>
          <Play className="w-5 h-5 mr-2 ml-0.5" />
          Play
        </Button>

        <Button variant="outline" size="lg" className="rounded-full glass" onClick={handleShuffle}>
          <Shuffle className="w-5 h-5 mr-2" />
          Shuffle
        </Button>

        {isOwnProfile ? (
          <>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full glass"
              onClick={() => navigate('/artist/dashboard')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Artist Dashboard
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full glass"
              onClick={() => navigate('/artist/upload')}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Content
            </Button>
          </>
        ) : (
          <Button
            variant={isFollowing ? 'outline' : 'default'}
            size="lg"
            className={`rounded-full ${isFollowing ? 'glass' : ''}`}
            onClick={handleFollowToggle}
          >
            {isFollowing
              ? <><UserCheck className="w-4 h-4 mr-2" />Following</>
              : <><UserPlus className="w-4 h-4 mr-2" />Follow</>}
          </Button>
        )}

        <Button variant="ghost" size="icon" className="rounded-full" onClick={handleShare}>
          <Share2 className="w-5 h-5" />
        </Button>
      </motion.div>

      {artist.bio && (
        <motion.section variants={itemVariants}>
          <GlassCard variant="card" className="p-6">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-muted-foreground">{artist.bio}</p>
          </GlassCard>
        </motion.section>
      )}

      {topSongs && topSongs.length > 0 && (
        <motion.section variants={itemVariants}>
          <SectionHeader title="Popular" />
          <GlassCard
            variant="card"
            className={`p-2 relative overflow-hidden ${(visibleSongsCount < topSongs.length || visibleSongsCount > 5) ? 'pb-16' : ''}`}
          >
            {topSongs.slice(0, visibleSongsCount).map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
                showArtist={false}
                onPlay={() => {
                  setQueue(topSongs);
                  setCurrentSong(song);
                  play();
                }}
              />
            ))}

            {visibleSongsCount < topSongs.length && (
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
            )}

            {(visibleSongsCount < topSongs.length || visibleSongsCount > 5) && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 pb-4">
                {visibleSongsCount < topSongs.length && (
                  <Button
                    variant="ghost"
                    className="font-semibold"
                    onClick={() => setVisibleSongsCount(prev => prev + 10)}
                  >
                    Show More
                  </Button>
                )}
                {visibleSongsCount > 5 && (
                  <Button
                    variant="ghost"
                    className="font-semibold glass"
                    onClick={() => setVisibleSongsCount(5)}
                  >
                    Show Less
                  </Button>
                )}
              </div>
            )}
          </GlassCard>
        </motion.section>
      )}

      {albums && albums.length > 0 && (
        <motion.section variants={itemVariants}>
          <SectionHeader title="Discography" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}