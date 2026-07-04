import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddToPlaylistDialog } from './add-to-playlist-dialog';
import { ListPlus } from 'lucide-react';

interface SongContextMenuProps {
  songId: string;
  children: React.ReactNode;
}

export function SongContextMenu({ songId, children }: SongContextMenuProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={(e) => {
            e.preventDefault();
            setIsDialogOpen(true);
          }}>
            <ListPlus className="w-4 h-4 mr-2" />
            Add to Playlist
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddToPlaylistDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        songId={songId}
      />
    </>
  );
}
