"use client";

import { Play, Pause } from "lucide-react";
import { Button } from "../components/ui/button";
import { cn, getAlbumCoverUrl } from "../lib/utils";

interface MediaCardProps {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  type: "song" | "album" | "artist" | "playlist" | "single";
  isPlaying?: boolean;
  onPlay?: () => void;
  onClick?: () => void;
}

export function MediaCard({
  title,
  subtitle,
  coverUrl,
  type,
  isPlaying = false,
  onPlay,
  onClick,
}: MediaCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 p-3 rounded-xl",
        "glass hover-glow transition-all cursor-pointer",
        "hover:bg-white/[0.06]"
      )}
      onClick={onClick}
    >

      <div className="relative aspect-square overflow-hidden">
        <img
          src={getAlbumCoverUrl(coverUrl)}
          alt={title}
          className={cn(
            "w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110",
            type === "artist" ? "rounded-full" : "rounded-lg"
          )}
        />

        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity",
          type === "artist" ? "rounded-full" : "rounded-lg"
        )} />

        <Button
          size="icon"
          className={cn(
            "absolute bottom-2 right-2 h-12 w-12 rounded-full",
            "bg-white text-black shadow-2xl transition-all",
            "hover:scale-110 hover:bg-white",
            "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0",
            isPlaying && "opacity-100 translate-y-0"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.();
          }}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 fill-current ml-0.5" />
          )}
        </Button>
      </div>

      <div className="flex flex-col gap-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground truncate">
          {type === "artist" ? "Artist" : subtitle}
        </p>
      </div>
    </div>
  );
}

interface MediaCardCompactProps {
  id: string;
  title: string;
  coverUrl: string;
  isPlaying?: boolean;
  onPlay?: () => void;
  onClick?: () => void;
}

export function MediaCardCompact({
  title,
  coverUrl,
  isPlaying = false,
  onPlay,
  onClick,
}: MediaCardCompactProps) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-md overflow-hidden transition-all cursor-pointer",
        "glass-strong hover:bg-white/[0.08]"
      )}
      onClick={onClick}
    >

      <img
        src={getAlbumCoverUrl(coverUrl)}
        alt={title}
        className="w-12 h-12 md:w-16 md:h-16 object-cover flex-shrink-0 group-hover:brightness-110 transition-all"
      />

      <span className="flex-1 text-sm font-semibold text-foreground truncate pr-2 group-hover:text-white transition-colors">
        {title}
      </span>

      <Button
        size="icon"
        className={cn(
          "absolute right-2 h-10 w-10 rounded-full bg-white text-black shadow-lg transition-all",
          "hover:scale-110 hover:bg-white",
          "opacity-0 group-hover:opacity-100",
          isPlaying && "opacity-100"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onPlay?.();
        }}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-4 w-4 fill-current ml-0.5" />
        )}
      </Button>
    </div>
  );
}
