'use client';

import { useParams, useNavigate, Link } from 'react-router-dom';

import { Play, Shuffle, Heart, Share2, Clock, MoreHorizontal, Trash2, ArrowLeft, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/glass-card';
import { SongCard } from '@/components/song-card';
import { AlbumCard } from '@/components/album-card';
import { SectionHeader } from '@/components/section-header';
import { useAlbum, useAlbumSongs, useArtistAlbums } from '@/lib/api';
import { usePlayerStore, useUserStore } from '@/lib/store';
import { formatDuration, getAlbumCoverUrl } from '@/lib/utils';
import { } from 'react';
import { toast } from 'sonner';

export default function AlbumPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, savedAlbums, toggleSaveAlbum } = useUserStore();
  const { data: album, error: albumError, isLoading: isAlbumLoading } = useAlbum(id);
  const { data: songs } = useAlbumSongs(id);
  const { data: moreAlbums } = useArtistAlbums(album?.artist.id || '');
  const { setCurrentSong, setQueue, play } = usePlayerStore();

  const isLiked = savedAlbums.includes(id);

  if (albumError || (!isAlbumLoading && !album)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 fade-in">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Music className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Album not found</h2>
        <p className="text-muted-foreground max-w-md text-center">
          Unfortunately, this album is no longer available. It may have been deleted by the artist or is currently restricted.
        </p>
        <Button variant="outline" className="mt-8 glass rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  if (isAlbumLoading || !album) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const otherAlbums = moreAlbums?.filter((a) => a.id !== album.id);

  const handlePlayAll = () => {
    if (songs && songs.length > 0) {
      setQueue(songs);
      setCurrentSong(songs[0]);
      play();
    }
  };

  const handleShuffle = () => {
    if (songs && songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      setCurrentSong(shuffled[0]);
      play();
    }
  };

  const handleLikeToggle = () => {
    toggleSaveAlbum(id);
    if (!isLiked) {
      toast.success('Added to your library');
    } else {
      toast.info('Removed from your library');
    }
  };

  const handleShare = () => {
    window.navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success('Link copied to clipboard!'));
  };

  const totalDuration = songs?.reduce((acc, song) => acc + song.duration, 0) || album.duration;
  const hours = Math.floor(totalDuration / 3600);
  const mins = Math.floor((totalDuration % 3600) / 60);

  return (
    <div
      className="space-y-8 fade-in"
    >

      <div className="relative">
        <GlassCard variant="card" className="relative overflow-hidden">

          <div className="absolute inset-0">
            <img
              src={getAlbumCoverUrl(album.id)}
              alt=""
              className="object-cover blur-3xl opacity-40 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>

          <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-end gap-6">

            <div
              className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 glow-primary transition-transform hover:scale-105"
            >
              <img
                src={getAlbumCoverUrl(album.id)}
                alt={album.title}
                width={224}
                height={224}
                className="object-cover">
              </img>
            </div>

            <div className="flex-1">
              <span className="text-xs uppercase tracking-wider text-primary mb-2 block">
                {album.type === 'album' ? 'Album' : album.type.toUpperCase()}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{album.title}</h1>
              <div className="flex items-center gap-2 flex-wrap text-sm">
                <Link
                  to={`/artist/${album.artist.id}`}
                  className="font-semibold hover:underline"
                >
                  {album.artist.name}
                </Link>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {new Date(album.releaseDate).getFullYear()}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {album.totalTracks} songs
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
      </div>

      <div className="flex items-center gap-4">
        <Button
          size="lg"
          className="rounded-full glow-primary"
          onClick={handlePlayAll}
        >
          <Play className="w-5 h-5 mr-2 ml-0.5" />
          Play
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full glass"
          onClick={handleShuffle}
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
          <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} color={isLiked ? 'hsl(var(--accent))' : undefined} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={handleShare}
        >
          <Share2 className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => toast.info('More options coming soon!')}
        >
          <MoreHorizontal className="w-5 h-5" />
        </Button>
        {user?.userId === album.artist.id && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this album? This action cannot be undone.')) {
                try {
                  const { CatalogService } = await import('@/api/catalog-api');
                  await CatalogService.deleteAlbum(album.id);
                  toast.success('Album deleted successfully');
                  navigate('/artist/dashboard');
                } catch (error) {
                  toast.error('Failed to delete album');
                }
              }
            }}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        )}
      </div>

      <section>
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

          {songs?.map((song, index) => (
            <SongCard
              key={song.id}
              song={song}
              index={index}
              showAlbum={false}
              onPlay={() => {
                setQueue(songs);
                setCurrentSong(song);
                play();
              }}
            />
          ))}
        </GlassCard>
      </section>

      {otherAlbums && otherAlbums.length > 0 && (
        <section>
          <SectionHeader
            title={`More by ${album.artist.name}`}
            href={`/artist/${album.artist.id}`}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {otherAlbums.slice(0, 6).map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      <section>
        <GlassCard variant="card" className="p-6">
          <h3 className="text-sm text-muted-foreground mb-2">
            {new Date(album.releaseDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          <p className="text-sm text-muted-foreground">
            © {new Date(album.releaseDate).getFullYear()} {album.artist.name}
          </p>
        </GlassCard>
      </section>
    </div>
  );
}