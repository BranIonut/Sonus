import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search, Plus, Loader2, Check } from 'lucide-react';
import { useSearch } from '@/lib/api';
import { PlaylistService } from '@/api/user-library-api';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { SongCard } from '@/components/song-card';

interface PlaylistAddSongDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
}

export function PlaylistAddSongDialog({ isOpen, onClose, playlistId }: PlaylistAddSongDialogProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);
  const observerTarget = useRef<HTMLDivElement>(null);
  const { mutate } = useSWRConfig();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setDisplayCount(20);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setDebouncedQuery('');
      setSelectedSongs(new Set());
      setDisplayCount(20);
    }
  }, [isOpen]);

  const { data: searchResults, isLoading: isSearchLoading } = useSearch(debouncedQuery);

  const songs = searchResults?.songs || [];
  const isSearching = debouncedQuery.trim().length > 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setDisplayCount(prev => Math.min(prev + 20, songs.length));
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => observer.disconnect();
  }, [songs.length]);

  const toggleSelection = (songId: string) => {
    setSelectedSongs(prev => {
      const next = new Set(prev);
      if (next.has(songId)) {
        next.delete(songId);
      } else {
        next.add(songId);
      }
      return next;
    });
  };

  const handleAddSelected = async () => {
    if (selectedSongs.size === 0) return;
    setIsSubmitting(true);
    try {

      await Promise.all(
        Array.from(selectedSongs).map(songId => 
          PlaylistService.addSongToPlaylist(playlistId, songId)
        )
      );
      toast.success(`Added ${selectedSongs.size} song${selectedSongs.size > 1 ? 's' : ''} to playlist`);
      mutate(['playlist', playlistId]);
      onClose();
    } catch (err) {
      console.error('Failed to add songs to playlist:', err);
      toast.error('Failed to add some songs to playlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-background border-border/50 shadow-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="w-full min-w-0 flex-shrink-0">
          <DialogTitle>Add Songs</DialogTitle>
          <DialogDescription>
            Search for songs to add to your playlist.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-4 w-full min-w-0 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for songs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-white/5 border-border/50 focus-visible:ring-primary/50"
          />
        </div>

        <ScrollArea className="flex-1 mt-4 pr-4 w-full min-w-0 min-h-[300px]">
          {isSearching && isSearchLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : isSearching && songs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No songs found.
            </div>
          ) : !isSearching ? (
            <div className="text-center py-8 text-muted-foreground">
              Type to search for songs.
            </div>
          ) : (
            <div className="space-y-2 w-full overflow-hidden pb-4">
              {songs.slice(0, displayCount).map((song) => (
                <div key={song.id} className="flex items-center gap-2 group relative w-full">
                  <div className="flex-1 min-w-0">
                    <SongCard song={song} showAlbum={false} variant="compact" />
                  </div>
                  <Button
                    variant={selectedSongs.has(song.id) ? "secondary" : "ghost"}
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => toggleSelection(song.id)}
                  >
                    {selectedSongs.has(song.id) ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
              {displayCount < songs.length && (
                <div ref={observerTarget} className="h-8 flex justify-center items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {selectedSongs.size > 0 && (
          <DialogFooter className="mt-4 pt-4 border-t border-border/50 flex-shrink-0 sm:justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {selectedSongs.size} song{selectedSongs.size > 1 ? 's' : ''} selected
            </div>
            <Button onClick={handleAddSelected} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                `Add to Playlist`
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
