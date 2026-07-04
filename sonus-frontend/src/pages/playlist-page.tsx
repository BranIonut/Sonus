import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Shuffle, Heart, Share2, Clock, MoreHorizontal, Lock, Globe, Trash2, ArrowLeft, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/glass-card';
import { SongCard } from '@/components/song-card';
import { usePlaylist } from '@/lib/api';
import { usePlayerStore, useUserStore } from '@/lib/store';
import { formatNumber, formatDuration, getAlbumCoverUrl, getPlaylistCoverUrl } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { getUserAvatar, getFallbackAvatarUrl } from '@/lib/utils';
import { get } from 'http';
import { useState } from 'react';
import { toast } from 'sonner';
import { PlaylistService } from '@/api/user-library-api';
import { Plus } from 'lucide-react';
import { PlaylistAddSongDialog } from '@/components/playlist-add-song-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

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

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const { data: playlist, error: playlistError, isLoading: isPlaylistLoading } = usePlaylist(id || "");
  const { setCurrentSong, setQueue, play } = usePlayerStore();
  const currentUser = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);

  if (playlistError || (!isPlaylistLoading && !playlist)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 fade-in">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <ListMusic className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Playlist not found</h2>
        <p className="text-muted-foreground max-w-md text-center">
          Unfortunately, this playlist is no longer available. It may have been deleted by the owner or is set to private.
        </p>
        <Button variant="outline" className="mt-8 glass rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  if (isPlaylistLoading || !playlist) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) {
      setQueue(playlist.songs);
      setCurrentSong(playlist.songs[0]);
      play();
    }
  };

  const handleShuffle = () => {
    if (playlist.songs.length > 0) {
      const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      setCurrentSong(shuffled[0]);
      play();
    }
  };

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      toast.success('Saved to your library');
    } else {
      toast.info('Removed from your library');
    }
  };

  const handleShare = () => {
    window.navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success('Link copied to clipboard!'));
  };

  const handleDeletePlaylist = async () => {
    if (!playlist) return;
    try {
      await PlaylistService.deletePlaylist(playlist.id);
      toast.success('Playlist deleted successfully');
      navigate('/library');
    } catch (error) {
      console.error('Failed to delete playlist', error);
      toast.error('Failed to delete playlist');
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!playlist) return;
    try {
      await PlaylistService.removeSongFromPlaylist(playlist.id, songId);
      toast.success('Song removed from playlist');
      import('swr').then(({ mutate }) => mutate(['playlist', playlist.id]));
    } catch (error) {
      console.error('Failed to remove song', error);
      toast.error('Failed to remove song');
    }
  };

  const totalDuration = playlist.songs.reduce((acc, song) => acc + song.duration, 0);
  const hours = Math.floor(totalDuration / 3600);
  const mins = Math.floor((totalDuration % 3600) / 60);

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
              src={getPlaylistCoverUrl(playlist.id)}
              alt=""
              className="object-cover blur-3xl opacity-40 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>

          <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-end gap-6">

            <motion.div
              className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 glow-accent"
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={getPlaylistCoverUrl(playlist.id)}
                alt={playlist.title}
                width={224}
                height={224}
                className="object-cover"
              />
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {playlist.isPublic ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Globe className="w-3 h-3" />
                    Public Playlist
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    Private Playlist
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{playlist.title}</h1>
              {playlist.description && (
                <p className="text-muted-foreground mb-4 max-w-2xl">
                  {playlist.description}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap text-sm">
                <Link
                  to={`/user/${playlist.owner.userId}`}
                  className="font-semibold hover:underline flex items-center gap-2"
                >
                  <img
                    src={getUserAvatar(playlist.owner.userId)}
                    alt={playlist.owner.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackAvatarUrl(); }}
                  />
                  {playlist.owner.name}
                </Link>
                {playlist.followers && playlist.followers > 0 && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {formatNumber(playlist.followers)} likes
                    </span>
                  </>
                )}
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {playlist.songs.length} songs
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <Button
          size="lg"
          className="rounded-full glow-primary"
          onClick={handlePlayAll}
          disabled={playlist.songs.length === 0}
        >
          <Play className="w-5 h-5 mr-2 ml-0.5" />
          Play
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full glass"
          onClick={handleShuffle}
          disabled={playlist.songs.length === 0}
        >
          <Shuffle className="w-5 h-5 mr-2" />
          Shuffle
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={handleLikeToggle}
        >
          <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={handleShare}
        >
          <Share2 className="w-5 h-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-heavy">
            {playlist.owner.userId === currentUser?.userId && (
              <DropdownMenuItem onSelect={() => setIsAddSongOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add song
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => toast.info('More options coming soon!')}>
              Other options...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {playlist.owner.userId === currentUser?.userId && (
          <Button
            variant="destructive"
            size="icon"
            className="rounded-full"
            onClick={handleDeletePlaylist}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        )}
      </motion.div>

      <motion.section variants={itemVariants}>
        {playlist.songs.length > 0 ? (
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

            {playlist.songs.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
                onPlay={() => {
                  setQueue(playlist.songs);
                  setCurrentSong(song);
                  play();
                }}
                onRemoveFromPlaylist={
                  playlist.owner.userId === currentUser?.userId 
                    ? handleRemoveSong 
                    : undefined
                }
              />
            ))}
          </GlassCard>
        ) : (
          <GlassCard variant="card" className="p-12 text-center">
            <p className="text-muted-foreground mb-4">This playlist is empty</p>
            <Button variant="outline" className="glass" onClick={() => setIsAddSongOpen(true)}>
              Add songs
            </Button>
          </GlassCard>
        )}
      </motion.section>

      <PlaylistAddSongDialog
        isOpen={isAddSongOpen}
        onClose={() => setIsAddSongOpen(false)}
        playlistId={playlist.id}
      />
    </motion.div>
  );
}