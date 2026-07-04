"use client";

import { Clock, Play, MoreHorizontal } from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { SongContextMenu } from "./song-context-menu";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  addedAt?: string;
}

interface TrackListProps {
  tracks: Track[];
  currentTrackId?: string;
  isPlaying?: boolean;
  onTrackSelect: (index: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function TrackList({
  tracks,
  currentTrackId,
  isPlaying,
  onTrackSelect,
}: TrackListProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-[16px_minmax(200px,4fr)_minmax(150px,2fr)_minmax(120px,1fr)_60px] gap-4 px-4 py-2 text-xs text-muted-foreground border-b border-border mb-2">
        <div className="flex items-center justify-center">#</div>
        <div>Title</div>
        <div>Album</div>
        <div className="hidden md:block">Date added</div>
        <div className="flex items-center justify-center">
          <Clock className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-0.5">
        {tracks.map((track, index) => {
          const isCurrentTrack = track.id === currentTrackId;
          
          return (
            <div
              key={track.id}
              className={cn(
                "group grid grid-cols-[16px_minmax(200px,4fr)_minmax(150px,2fr)_minmax(120px,1fr)_60px] gap-4 px-4 py-2 rounded-md transition-colors",
                "hover:bg-secondary/50 cursor-pointer",
                isCurrentTrack && "bg-secondary/30"
              )}
              onClick={() => onTrackSelect(index)}
              onDoubleClick={() => onTrackSelect(index)}
            >
              <div className="flex items-center justify-center text-sm tabular-nums">
                <span
                  className={cn(
                    "group-hover:hidden",
                    isCurrentTrack ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {isCurrentTrack && isPlaying ? (
                    <div className="flex items-end gap-0.5 h-3">
                      <span className="w-0.5 h-full bg-primary animate-pulse" />
                      <span className="w-0.5 h-2/3 bg-primary animate-pulse delay-75" />
                      <span className="w-0.5 h-1/3 bg-primary animate-pulse delay-150" />
                    </div>
                  ) : (
                    index + 1
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden group-hover:flex h-4 w-4 text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrackSelect(index);
                  }}
                >
                  <Play className="h-3 w-3 fill-current" />
                </Button>
              </div>

              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={track.coverUrl}
                  alt={`${track.album} cover`}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      isCurrentTrack ? "text-primary" : "text-foreground"
                    )}
                  >
                    {track.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate hover:underline">
                    {track.artist}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <p className="text-sm text-muted-foreground truncate hover:underline">
                  {track.album}
                </p>
              </div>

              <div className="hidden md:flex items-center">
                <p className="text-sm text-muted-foreground">
                  {track.addedAt || "—"}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <SongContextMenu songId={track.id}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </SongContextMenu>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {formatTime(track.duration)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}