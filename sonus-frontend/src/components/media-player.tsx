import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  ListMusic,
  Maximize2,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, getAlbumCoverUrl } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { GlassCard } from './glass-card';
import { usePlayerStore, useUserStore, useUIStore } from '../lib/store';
import { formatDuration } from '../lib/utils';
import { StreamingService } from '@/api/streaming-api';
import { QueuePopup } from './queue-popup';

export function MediaPlayer() {
  const {
    currentSong,
    isPlaying,
    volume,
    progress,
    duration,
    shuffle,
    repeat,
    togglePlay,
    setVolume,
    setProgress,
    setDuration,
    toggleShuffle,
    cycleRepeat,
    playNext,
    playPrevious,
  } = usePlayerStore();

  const { likedSongs, toggleLike, addToRecentlyPlayed } = useUserStore();
  const { playerExpanded, setPlayerExpanded } = useUIStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [localProgress, setLocalProgress] = useState(progress);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const isSeeking = useRef(false);
  const hasRecordedPlayRef = useRef<boolean>(false);

  const isLiked = currentSong ? likedSongs.includes(currentSong.id) : false;

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      if (!isSeeking.current) {
        setProgress(audio.currentTime);
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const state = usePlayerStore.getState();
      if (state.repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => { });
      } else {
        state.playNext();
      }
    };

    audio.removeEventListener('ended', handleEnded);
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const loadSong = async () => {
      setIsLoading(true);
      hasRecordedPlayRef.current = false;

      if (currentSong.audioUrl) {
        const streamUrl = StreamingService.getAudioStreamUrl(currentSong.audioUrl);
        audio.src = streamUrl;
        audio.load();
        if (usePlayerStore.getState().isPlaying) {
          await audio.play().catch(() => { });
        }
      } else {

        setDuration(currentSong.duration || 0);
      }
      setIsLoading(false);
      addToRecentlyPlayed(currentSong);
    };
    loadSong();
  }, [currentSong?.id]);

  useEffect(() => {
    if (!currentSong || hasRecordedPlayRef.current) return;

    if (progress >= 30) {
      const user = useUserStore.getState().user;
      if (user) {
        hasRecordedPlayRef.current = true;
        StreamingService.recordPlayEvent({
          songId: currentSong.id,
          userId: user.userId,
          listenDurationSeconds: Math.floor(progress)
        }).catch(err => console.error("Failed to record play event", err));
      }
    }
  }, [progress, currentSong]);

  useEffect(() => {
    if (!isSeeking.current) {
      setLocalProgress(progress);
      if (progress === 0 && audioRef.current && audioRef.current.currentTime > 1) {
        audioRef.current.currentTime = 0;
      }
    }
  }, [progress]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.play().catch(() => { });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const handleVolumeToggle = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleProgressChange = (value: number[]) => {
    isSeeking.current = true;
    setLocalProgress(value[0]);
  };

  const handleProgressCommit = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = value[0];
    setProgress(value[0]);
    isSeeking.current = false;
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) {
      setIsMuted(false);
    }
  };

  const coverUrl = currentSong ? (currentSong.album
    ? getAlbumCoverUrl(currentSong.album.id)
    : getAlbumCoverUrl(currentSong.coverUrl)) : '';

  return (
    <>
      <AnimatePresence>
        {isQueueOpen && <QueuePopup onClose={() => setIsQueueOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {currentSong && playerExpanded && (
          <motion.div
            key="expanded-player"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-background"
          >

            <div className="absolute inset-0 overflow-hidden">
              <img
                src={coverUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-150"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
            </div>

            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl ambient-orb" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/20 blur-3xl ambient-orb" style={{ animationDelay: '-5s' }} />

            <motion.div
              className="relative z-10 h-full flex flex-col items-center justify-center px-8 py-12"
              animate={{ paddingRight: isQueueOpen ? '24rem' : '2rem' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >

              <motion.div
                className="absolute top-6 z-20"
                animate={{ right: isQueueOpen ? '25.5rem' : '1.5rem' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPlayerExpanded(false)}
                >
                  <ChevronDown className="w-6 h-6" />
                </Button>
              </motion.div>

              <div
                className="relative w-72 h-72 md:w-96 md:h-96 mb-8 animate-[spin_30s_linear_infinite]"
                style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
              >
                <div className="w-full h-full rounded-full overflow-hidden shadow-2xl glow-primary">
                  <img
                    src={coverUrl}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                <div className="absolute inset-[45%] rounded-full bg-background/80" />
              </div>

              <div className="text-center mb-8 max-w-md">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gradient">{currentSong.title}</h2>
                <Link
                  to={`/artist/${currentSong.artist.id}`}
                  className="text-lg text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setPlayerExpanded(false)}
                >
                  {currentSong.artist.name}
                </Link>
              </div>

              <div className="w-full max-w-md mb-6">
                <Slider
                  value={[localProgress]}
                  max={duration || 100}
                  step={0.01}
                  onValueChange={handleProgressChange}
                  onValueCommit={handleProgressCommit}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatDuration(localProgress)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleShuffle}
                  className={cn(shuffle && 'text-primary')}
                >
                  <Shuffle className="w-5 h-5" />
                </Button>

                <Button variant="ghost" size="icon" onClick={playPrevious}>
                  <SkipBack className="w-6 h-6" />
                </Button>

                <motion.button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-primary flex items-center justify-center glow-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 text-primary-foreground" />
                  ) : (
                    <Play className="w-7 h-7 text-primary-foreground ml-1" />
                  )}
                </motion.button>

                <Button variant="ghost" size="icon" onClick={playNext}>
                  <SkipForward className="w-6 h-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cycleRepeat}
                  className={cn(repeat !== 'off' && 'text-primary')}
                >
                  {repeat === 'one' ? (
                    <Repeat1 className="w-5 h-5" />
                  ) : (
                    <Repeat className="w-5 h-5" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleLike(currentSong.id)}
                  className={cn(isLiked && 'text-accent')}
                >
                  <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
                </Button>

                <div className="flex items-center gap-2 w-32">
                  <Button variant="ghost" size="icon" onClick={handleVolumeToggle}>
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsQueueOpen(!isQueueOpen)}
                  className={cn(isQueueOpen && 'bg-white/10 text-primary')}
                >
                  <ListMusic className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentSong && !playerExpanded && (
          <motion.div
            key="mini-player"
            initial={{ y: '100%', opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              paddingRight: isQueueOpen ? '25rem' : '1rem'
            }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-40 pl-4 pb-4"
          >
            <GlassCard variant="heavy" className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4 p-3">

                <button
                  onClick={() => setPlayerExpanded(true)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <motion.div
                    className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                    whileHover={{ scale: 1.5 }}
                  >
                    <img
                      src={coverUrl}
                      alt={currentSong.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </motion.div>
                  <div className="min-w-0">
                    <p className="font-medium truncate text-sm">{currentSong.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentSong.artist.name}</p>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={toggleShuffle}>
                    <Shuffle className={cn('w-4 h-4', shuffle && 'text-primary')} />
                  </Button>

                  <Button variant="ghost" size="icon" onClick={playPrevious}>
                    <SkipBack className="w-4 h-4" />
                  </Button>

                  <motion.button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-primary flex items-center justify-center glow-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
                    )}
                  </motion.button>

                  <Button variant="ghost" size="icon" onClick={playNext}>
                    <SkipForward className="w-4 h-4" />
                  </Button>

                  <Button variant="ghost" size="icon" onClick={cycleRepeat}>
                    {repeat === 'one' ? (
                      <Repeat1 className={cn('w-4 h-4', 'text-primary')} />
                    ) : (
                      <Repeat className={cn('w-4 h-4', repeat === 'all' && 'text-primary')} />
                    )}
                  </Button>
                </div>

                <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {formatDuration(localProgress)}
                  </span>
                  <Slider
                    value={[localProgress]}
                    max={duration || 100}
                    step={0.001}
                    onValueChange={handleProgressChange}
                    onValueCommit={handleProgressCommit}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-10">
                    {formatDuration(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex"
                    onClick={() => toggleLike(currentSong.id)}
                  >
                    <Heart className={cn('w-4 h-4', isLiked && 'fill-current text-accent')} />
                  </Button>

                  <div className="hidden lg:flex items-center gap-1 w-28">
                    <Button variant="ghost" size="icon" onClick={handleVolumeToggle}>
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                    <Slider
                      value={[volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-20"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsQueueOpen(!isQueueOpen)}
                    className={cn(isQueueOpen && 'bg-white/10 text-primary')}
                  >
                    <ListMusic className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPlayerExpanded(true)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="md:hidden px-3 pb-2">
                <Slider
                  value={[localProgress]}
                  max={duration || 100}
                  step={0.001}
                  onValueChange={handleProgressChange}
                  onValueCommit={handleProgressCommit}
                />
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}