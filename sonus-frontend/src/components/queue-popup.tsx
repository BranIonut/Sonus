import { motion, Reorder } from 'framer-motion';
import { usePlayerStore } from '../lib/store';
import { X, GripVertical, Play } from 'lucide-react';
import { Button } from './ui/button';
import { GlassCard } from './glass-card';
import { getAlbumCoverUrl, formatDuration } from '../lib/utils';
import { cn } from '../lib/utils';

export function QueuePopup({ onClose }: { onClose: () => void }) {
  const { currentSong, userQueue, queue, reorderUserQueue, setCurrentSong, isPlaying } = usePlayerStore();

  const currentIndex = currentSong ? queue.findIndex((s) => s.id === currentSong.id) : -1;
  const upcomingQueue = currentIndex !== -1 ? queue.slice(currentIndex + 1, currentIndex + 51) : queue.slice(0, 50);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 bottom-0 w-80 sm:w-96 z-[100] bg-black/60 backdrop-blur-3xl border-l border-red-500/50 shadow-[-20px_0_50px_-12px_rgba(239,68,68,0.15)] flex flex-col"
    >
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-transparent">
        <h3 className="text-xl font-bold text-white tracking-wide">Queue</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 hover:bg-white/10 text-white rounded-full">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {currentSong && (
            <div className="mb-6 px-2 pt-2">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 pl-1">Now Playing</h4>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 shadow-lg">
                  <img src={getAlbumCoverUrl(currentSong.album?.id || currentSong.coverUrl)} alt="" className="w-full h-full object-cover" />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">{currentSong.title}</p>
                  <p className="text-xs text-primary/80 truncate">{currentSong.artist.name}</p>
                </div>
              </div>
            </div>
          )}

          {userQueue.length > 0 && (
            <div className="mb-8">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 pl-1">Next In Queue</h4>
              <Reorder.Group axis="y" values={userQueue} onReorder={reorderUserQueue} className="flex flex-col gap-1">
                {userQueue.map((song) => (
                  <Reorder.Item
                    key={song.id}
                    value={song}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-grab active:cursor-grabbing bg-white/5 border border-white/5"
                  >
                    <div className="text-muted-foreground hover:text-white transition-colors px-2 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                    </div>
                    <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 shadow-md">
                      <img src={getAlbumCoverUrl(song.album?.id || song.coverUrl)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium truncate">{song.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{song.artist.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground pr-2">{formatDuration(song.duration)}</span>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          )}

          {upcomingQueue.length > 0 && (
            <div className="px-2 mb-8">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 pl-1">Next From Context</h4>
              <div className="flex flex-col gap-1">
                {upcomingQueue.map((song, i) => (
                  <div key={`${song.id}-${i}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 shadow-md">
                      <img src={getAlbumCoverUrl(song.album?.id || song.coverUrl)} alt="" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setCurrentSong(song)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Play className="w-4 h-4 ml-0.5" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium truncate group-hover:text-primary transition-colors">{song.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{song.artist.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground pr-2">{formatDuration(song.duration)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userQueue.length === 0 && upcomingQueue.length === 0 && !currentSong && (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <p className="text-sm">Your queue is empty</p>
            </div>
          )}
      </div>
    </motion.div>
  );
}
