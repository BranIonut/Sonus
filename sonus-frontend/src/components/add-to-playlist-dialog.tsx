import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlaylistService, BackendPlaylist } from '@/api/user-library-api';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface AddToPlaylistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  songId: string;
}

export function AddToPlaylistDialog({ isOpen, onClose, songId }: AddToPlaylistDialogProps) {
  const [playlists, setPlaylists] = useState<BackendPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      PlaylistService.getMyPlaylists()
        .then(setPlaylists)
        .catch((err) => {
          console.error('Failed to load playlists:', err);
          toast.error('Failed to load playlists');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  const handleAddToPlaylist = async (playlistId: string) => {
    setAddingId(playlistId);
    try {
      await PlaylistService.addSongToPlaylist(playlistId, songId);
      toast.success('Added to playlist');
      onClose();
    } catch (err) {
      console.error('Failed to add song to playlist:', err);
      toast.error('Failed to add song to playlist');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <DialogDescription>
            Select a playlist to add this song to.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[300px] mt-4 pr-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : playlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
              <p>You don't have any playlists yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center gap-2 rounded-md border px-3 py-2"
                >
                  <span className="flex-1 min-w-0 truncate text-sm font-normal">
                    {playlist.title}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    disabled={!playlist.id || addingId === playlist.id}
                    onClick={() => playlist.id && handleAddToPlaylist(playlist.id)}
                  >
                    <Plus className="w-4 h-4 mr-1 opacity-70" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}