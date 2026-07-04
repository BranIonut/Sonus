"use client";

import { useState, useRef } from "react";
import { Router } from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
    Image as ImageIcon,
    Music,
    Plus,
    X,
    Search,
    GripVertical,
    Play,
    Trash2,
    Save,
    ArrowLeft,
    Clock,
    Disc3,
    Loader2,
    Sparkles,
    Upload,
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Song } from "@/types/music";
import { useSongs } from "@/lib/api";
import { PlaylistService } from "@/api/user-library-api";
import { useNavigate } from "react-router-dom";

interface PlaylistFormData {
    name: string;
    description: string;
    coverImage: string | null;
    coverFile: File | null;
    isPublic: boolean;
    songs: Song[];
}

export default function PlaylistCreatePage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSongSearch, setShowSongSearch] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState<PlaylistFormData>({
        name: "",
        description: "",
        coverImage: null,
        coverFile: null,
        isPublic: true,
        songs: [],
    });

    const { data: allSongData } = useSongs();

    const availableSongs = (allSongData || []).filter(
        (song) =>
            !formData.songs.find((s) => s.id === song.id) &&
            (song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                song.artist.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({
                    ...prev,
                    coverImage: reader.result as string,
                    coverFile: file,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const addSong = (song: Song) => {
        setFormData((prev) => ({
            ...prev,
            songs: [...prev.songs, song],
        }));
    };

    const removeSong = (songId: string) => {
        setFormData((prev) => ({
            ...prev,
            songs: prev.songs.filter((s) => s.id !== songId),
        }));
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return;
        setIsSaving(true);

        try {
            const playlist = await PlaylistService.createPlaylist({
                title: formData.name,
                description: formData.description,
            });
            console.log("Playlist created:", playlist);

            if (playlist.id) {
                if (formData.coverFile) {
                    const { UploadContentService } = await import("@/api/upload-content-api");
                    await UploadContentService.uploadPlaylistCover(playlist.id, formData.coverFile);
                }

                for (const song of formData.songs) {
                    await PlaylistService.addSongToPlaylist(playlist.id, song.id);
                }
            }
            toast.success("Playlist created successfully!");
            window.location.href = '/library';
        } catch (error) {
            console.error("Error creating playlist:", error);
            toast.error("Failed to create playlist");
        } finally {
            setIsSaving(false);
        }
    };

    const totalDuration = formData.songs.reduce((acc, song) => {
        const [mins, secs] = song.duration.toString().split(":").map(Number);
        return acc + mins * 60 + secs;
    }, 0);

    const formatTotalDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours} hr ${mins} min`;
        }
        return `${mins} min`;
    };

    return (
        <div className="space-y-6">

            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/playlist/create')}
                    className="hover:bg-white/10"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Create Playlist</h1>
                    <p className="text-muted-foreground mt-1">
                        Build your perfect music collection
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-1 space-y-6">
                    <GlassCard className="p-6">

                        <div className="mb-6">
                            <Label className="text-foreground/80 mb-2 block">
                                Cover Image
                            </Label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "relative aspect-square rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden group",
                                    formData.coverImage
                                        ? "border-primary/50"
                                        : "border-white/20 hover:border-white/40"
                                )}
                            >
                                {formData.coverImage ? (
                                    <>
                                        <img
                                            src={formData.coverImage}
                                            alt="Playlist cover"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Upload className="w-8 h-8 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                                        <ImageIcon className="w-12 h-12 mb-2" />
                                        <p className="text-sm">Click to upload</p>
                                        <p className="text-xs mt-1">PNG, JPG up to 10MB</p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                className="hidden"
                            />
                        </div>

                        <div className="space-y-2 mb-4">
                            <Label htmlFor="name" className="text-foreground/80">
                                Playlist Name *
                            </Label>
                            <Input
                                id="name"
                                placeholder="My Awesome Playlist"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                                }
                                className="bg-white/5 border-white/10 focus:border-primary"
                            />
                        </div>

                        <div className="space-y-2 mb-4">
                            <Label htmlFor="description" className="text-foreground/80">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Add an optional description..."
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                className="bg-white/5 border-white/10 focus:border-primary min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="flex items-center justify-between py-4 border-t border-white/10">
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Make Public
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Others can discover and follow
                                </p>
                            </div>
                            <Switch
                                checked={formData.isPublic}
                                onCheckedChange={(checked) =>
                                    setFormData((prev) => ({ ...prev, isPublic: checked }))
                                }
                            />
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-white/10 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Music className="w-4 h-4" />
                                {formData.songs.length} songs
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatTotalDuration(totalDuration)}
                            </span>
                        </div>
                    </GlassCard>

                    <Button
                        onClick={handleSave}
                        disabled={!formData.name.trim() || isSaving}
                        className="w-full h-12"
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5 mr-2" />
                        )}
                        Create Playlist
                    </Button>
                </div>

                <div className="lg:col-span-2 space-y-6">

                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                <Music className="w-5 h-5 text-primary" />
                                Songs
                            </h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSongSearch(!showSongSearch)}
                                className="bg-white/5 border-white/10 hover:bg-white/10"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Songs
                            </Button>
                        </div>

                        <AnimatePresence>
                            {showSongSearch && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mb-4"
                                >
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="relative mb-4">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search songs..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 bg-white/5 border-white/10 focus:border-primary"
                                            />
                                        </div>
                                        <ScrollArea className="h-[200px]">
                                            <div className="space-y-2">
                                                {availableSongs.slice(0, 10).map((song) => (
                                                    <motion.div
                                                        key={song.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 group cursor-pointer"
                                                        onClick={() => addSong(song)}
                                                    >
                                                        <img
                                                            src={song.coverUrl}
                                                            alt={song.title}
                                                            className="w-10 h-10 rounded-lg object-cover"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">
                                                                {song.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {song.artist.name || "Unknown Artist"}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {formData.songs.length > 0 ? (
                            <Reorder.Group
                                axis="y"
                                values={formData.songs}
                                onReorder={(songs) =>
                                    setFormData((prev) => ({ ...prev, songs }))
                                }
                                className="space-y-2"
                            >
                                {formData.songs.map((song, index) => (
                                    <Reorder.Item
                                        key={song.id}
                                        value={song}
                                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 group cursor-grab active:cursor-grabbing"
                                    >
                                        <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="w-6 text-sm text-muted-foreground text-center">
                                            {index + 1}
                                        </span>
                                        <img
                                            src={song.coverUrl}
                                            alt={song.title}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate">
                                                {song.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {song.artist.name || "Unknown Artist"}
                                            </p>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {song.duration}
                                        </span>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => removeSong(song.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <Disc3 className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground mb-2">No songs added yet</p>
                                <p className="text-sm text-muted-foreground/60">
                                    Click &quot;Add Songs&quot; to start building your playlist
                                </p>
                            </div>
                        )}
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-foreground">
                                Suggested for You
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {(allSongData || []).map((song) => (
                                <motion.div
                                    key={song.id}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => {
                                        if (!formData.songs.find((s) => s.id === song.id)) {
                                            addSong(song);
                                        }
                                    }}
                                    className={cn(
                                        "p-3 rounded-xl border cursor-pointer transition-all",
                                        formData.songs.find((s) => s.id === song.id)
                                            ? "bg-primary/20 border-primary opacity-50"
                                            : "bg-white/5 border-white/10 hover:border-white/20"
                                    )}
                                >
                                    <img
                                        src={song.coverUrl}
                                        alt={song.title}
                                        className="w-full aspect-square rounded-lg object-cover mb-2"
                                    />
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {song.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {song.artist.name || "Unknown Artist"}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}