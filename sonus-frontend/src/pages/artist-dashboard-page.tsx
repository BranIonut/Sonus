"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Image as ImageIcon,
  Music,
  Plus,
  X,
  Upload,
  Save,
  Camera,
  Disc3,
  Calendar,
  Tag,
  Building2,
  Loader2,
  Trash2,
  Edit3,
  Eye,
  BarChart3,
  Users,
  Play,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useArtistAlbums } from "@/lib/api";
import { useUserStore } from "@/lib/store";
import { useEffect } from "react";
import { ArtistService, ArtistProfile as ApiArtistProfile } from "@/api/artist-api";
import { AnalyticsService } from "@/api/analytics-api";
import { CatalogService } from "@/api/catalog-api";
import { UploadContentService } from "@/api/upload-content-api";

const genres = [
  "Pop",
  "Rock",
  "Hip-Hop",
  "R&B",
  "Electronic",
  "Jazz",
  "Classical",
  "Country",
  "Folk",
  "Indie",
  "Alternative",
  "Metal",
  "Reggae",
  "Blues",
  "Soul",
];

const recordLabels = [
  "Independent",
  "Universal Music",
  "Sony Music",
  "Warner Music",
  "Atlantic Records",
  "Interscope",
  "Columbia Records",
  "Republic Records",
];

interface ArtistProfile {
  name: string;
  bio: string;
  avatar: string;
  coverImage: string;
  verified: boolean;
  monthlyListeners: number;
}

interface NewAlbum {
  title: string;
  description: string;
  coverImage: string | null;
  releaseDate: string;
  genre: string;
  recordLabel: string;
  songs: NewSong[];
}

interface NewSong {
  id: string;
  title: string;
  duration: string;
  audioFile: File | null;
  explicit: boolean;
}

export default function ArtistDashboardPage() {
  const { user } = useUserStore();
  const artistId = user?.userId;

  const { data: albums } = useArtistAlbums(artistId || '');

  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showNewAlbumForm, setShowNewAlbumForm] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const albumCoverInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const [profile, setProfile] = useState<ArtistProfile>({
    name: "",
    bio: "",
    avatar: "",
    coverImage: "",
    verified: false,
    monthlyListeners: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  const [songStats, setSongStats] = useState<Record<string, number>>({});
  const [albumStats, setAlbumStats] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!artistId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const load = async () => {
      try {
        const p = await ArtistService.getArtistProfile(artistId);

        setProfile({
          name: p.stageName,
          bio: p.bio || '',
          avatar: p.profilePictureUrl || "",
          coverImage: "",
          verified: p.isVerified,
          monthlyListeners: 0,
        });
        try {
          const stats = await AnalyticsService.getArtistStats(artistId);
          setProfile(prev => ({
            ...prev,
            monthlyListeners: stats.totalPlays
          }));
        } catch (e) {
          console.error(e);
        }
      } catch (e) {
        console.error(e);

        if (user) {
          setProfile({
            name: user.name || user.username || "Artist",
            bio: "",
            avatar: "",
            coverImage: "",
            verified: false,
            monthlyListeners: 0,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();

  }, [artistId, user]);

  const [rawAlbums, setRawAlbums] = useState<any[]>([]);

  useEffect(() => {
    if (artistId) {
      CatalogService.getArtistAlbums(artistId).then(setRawAlbums).catch(console.error);
    }
  }, [artistId]);

  useEffect(() => {
    if (rawAlbums && rawAlbums.length > 0) {
      const loadStats = async () => {
        const sStats: Record<string, number> = {};
        const aStats: Record<string, number> = {};

        for (const album of rawAlbums) {
          let albumTotal = 0;
          for (const song of album.songs || []) {
            try {
              if (song.songId) {
                const stat = await AnalyticsService.getSongStats(song.songId);
                sStats[song.songId] = stat.totalPlays;
                albumTotal += stat.totalPlays;
              }
            } catch (e) {

              if (song.songId) sStats[song.songId] = 0;
            }
          }
          if (album.albumId) aStats[album.albumId] = albumTotal;
        }
        setSongStats(sStats);
        setAlbumStats(aStats);
      };
      loadStats();
    }
  }, [rawAlbums]);

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);

  const [newAlbum, setNewAlbum] = useState<NewAlbum>({
    title: "",
    description: "",
    coverImage: null,
    releaseDate: "",
    genre: "",
    recordLabel: "",
    songs: [],
  });

  const handlePublishAlbum = async () => {
    if (!newAlbum.title || !newAlbum.releaseDate || newAlbum.songs.length === 0) {
      return;
    }
    setIsSaving(true);
    try {
      await CatalogService.createAlbum(artistId || '', {
        title: newAlbum.title,
        description: newAlbum.description,
        genre: newAlbum.genre,
        type: "ALBUM",
        releaseDate: new Date(newAlbum.releaseDate).toISOString(),
        recordLabel: newAlbum.recordLabel,
      });
      setShowNewAlbumForm(false);
      setNewAlbum({
        title: "",
        description: "",
        coverImage: null,
        releaseDate: "",
        genre: "",
        recordLabel: "",
        songs: [],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCover(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAlbumCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAlbum((prev) => ({
          ...prev,
          coverImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSongToAlbum = () => {
    const newSong: NewSong = {
      id: `new-song-${Date.now()}`,
      title: "",
      duration: "0:00",
      audioFile: null,
      explicit: false,
    };
    setNewAlbum((prev) => ({
      ...prev,
      songs: [...prev.songs, newSong],
    }));
  };

  const updateSongInAlbum = (songId: string, updates: Partial<NewSong>) => {
    setNewAlbum((prev) => ({
      ...prev,
      songs: prev.songs.map((s) =>
        s.id === songId ? { ...s, ...updates } : s
      ),
    }));
  };

  const removeSongFromAlbum = (songId: string) => {
    setNewAlbum((prev) => ({
      ...prev,
      songs: prev.songs.filter((s) => s.id !== songId),
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await ArtistService.updateArtistProfile(artistId || '', {
        stageName: profile.name,
        bio: profile.bio,
      });

      if (selectedAvatarFile) {
        await UploadContentService.uploadProfilePicture(artistId || '', selectedAvatarFile);
        setProfile((prev) => ({ ...prev, avatar: previewAvatar || prev.avatar }));
        setPreviewAvatar(null);
        setSelectedAvatarFile(null);
      } else if (previewAvatar) {
        setProfile((prev) => ({ ...prev, avatar: previewAvatar }));
        setPreviewAvatar(null);
      }

      if (selectedCoverFile) {
        setProfile((prev) => ({ ...prev, coverImage: previewCover || prev.coverImage }));
        setPreviewCover(null);
        setSelectedCoverFile(null);
      } else if (previewCover) {
        setProfile((prev) => ({ ...prev, coverImage: previewCover }));
        setPreviewCover(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const artistAlbums = albums?.slice(0, 4) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Artist Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile, albums, and releases
          </p>
        </div>
        <Button
          onClick={() => setShowNewAlbumForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Release
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Monthly Listeners",
            value: profile.monthlyListeners > 0 ? (profile.monthlyListeners).toLocaleString() : "0",
            icon: Users,
            change: "This month",
          },
          { label: "Total Streams", value: Object.values(albumStats).reduce((a, b) => a + b, 0).toLocaleString(), icon: Play, change: "All time" },
          { label: "Albums", value: albums?.length || "0", icon: Disc3, change: "Released" },
          { label: "Followers", value: "0", icon: BarChart3, change: "Fans" },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stat.value}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
          </GlassCard>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="albums"
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Albums & Releases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">

          <GlassCard className="overflow-hidden">
            <div
              onClick={() => coverInputRef.current?.click()}
              className="relative h-48 cursor-pointer group"
            >
              <img
                src={`http://localhost:9040/storage/users-avatars/${profile.coverImage}.png`}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Change Cover Image</p>
                </div>
              </div>
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />

            <div className="p-6 -mt-16 relative">
              <div className="flex flex-col md:flex-row gap-6">

                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative cursor-pointer group"
                >
                  <Avatar className="w-32 h-32 border-4 border-background">
                    <AvatarImage src={previewAvatar || profile.avatar} />
                    <AvatarFallback className="text-3xl bg-primary/20">
                      {profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                <div className="flex-1 space-y-4 pt-8 md:pt-0">
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Artist Name</Label>
                    <Input
                      value={profile.name}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="bg-white/5 border-white/10 focus:border-primary max-w-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Bio</Label>
                    <Textarea
                      value={profile.bio}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      className="bg-white/5 border-white/10 focus:border-primary min-h-[100px] resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {profile.verified && (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Verified Artist
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-6 border-t border-white/10">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Profile
                </Button>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Top Songs
            </h2>
            <div className="space-y-2">
              {rawAlbums && rawAlbums.length > 0 ? rawAlbums.flatMap(a => (a.songs || []).map((s: any) => ({ ...s, albumTitle: a.title })))
                .sort((a, b) => (songStats[b.songId || ''] || 0) - (songStats[a.songId || ''] || 0))
                .slice(0, 5)
                .map((song: any, idx: number) => (
                  <div key={song.songId || idx} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-lg group">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground w-4 text-center font-medium">{idx + 1}</span>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">{song.title}</p>
                        <p className="text-xs text-muted-foreground">{song.albumTitle}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium bg-black/20 px-3 py-1 rounded-full">
                      {(songStats[song.songId || ''] || 0).toLocaleString()} streams
                    </div>
                  </div>
                )) : (
                <p className="text-muted-foreground text-sm text-center py-8">No songs available yet. Create a release to see stats!</p>
              )}
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="albums" className="space-y-6">

          <AnimatePresence>
            {showNewAlbumForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <GlassCard className="p-6 border-primary/30">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Disc3 className="w-5 h-5 text-primary" />
                      New Album Release
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNewAlbumForm(false)}
                      className="hover:bg-white/10"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="space-y-4">

                      <div
                        onClick={() => albumCoverInputRef.current?.click()}
                        className={cn(
                          "aspect-square rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden group",
                          newAlbum.coverImage
                            ? "border-primary/50"
                            : "border-white/20 hover:border-white/40"
                        )}
                      >
                        {newAlbum.coverImage ? (
                          <>
                            <img
                              src={newAlbum.coverImage + ".png"}
                              alt="Album cover"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Upload className="w-8 h-8 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                            <ImageIcon className="w-12 h-12 mb-2" />
                            <p className="text-sm">Upload Cover</p>
                          </div>
                        )}
                      </div>
                      <input
                        ref={albumCoverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAlbumCoverChange}
                        className="hidden"
                      />

                      <div className="space-y-2">
                        <Label className="text-foreground/80">Album Title *</Label>
                        <Input
                          placeholder="Enter album title"
                          value={newAlbum.title}
                          onChange={(e) =>
                            setNewAlbum((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="bg-white/5 border-white/10 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground/80">Description</Label>
                        <Textarea
                          placeholder="Describe your album..."
                          value={newAlbum.description}
                          onChange={(e) =>
                            setNewAlbum((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="bg-white/5 border-white/10 focus:border-primary min-h-[80px] resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground/80 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Release Date *
                        </Label>
                        <Input
                          type="date"
                          value={newAlbum.releaseDate}
                          onChange={(e) =>
                            setNewAlbum((prev) => ({
                              ...prev,
                              releaseDate: e.target.value,
                            }))
                          }
                          className="bg-white/5 border-white/10 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground/80 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Genre
                        </Label>
                        <Select
                          value={newAlbum.genre}
                          onValueChange={(value) =>
                            setNewAlbum((prev) => ({ ...prev, genre: value }))
                          }
                        >
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue placeholder="Select genre" />
                          </SelectTrigger>
                          <SelectContent>
                            {genres.map((genre) => (
                              <SelectItem key={genre} value={genre}>
                                {genre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground/80 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Record Label
                        </Label>
                        <Select
                          value={newAlbum.recordLabel}
                          onValueChange={(value) =>
                            setNewAlbum((prev) => ({
                              ...prev,
                              recordLabel: value,
                            }))
                          }
                        >
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue placeholder="Select label" />
                          </SelectTrigger>
                          <SelectContent>
                            {recordLabels.map((label) => (
                              <SelectItem key={label} value={label}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-foreground/80 flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          Tracks ({newAlbum.songs.length})
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addSongToAlbum}
                          className="bg-white/5 border-white/10 hover:bg-white/10"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Track
                        </Button>
                      </div>

                      <ScrollArea className="h-[400px]">
                        {newAlbum.songs.length > 0 ? (
                          <div className="space-y-3">
                            {newAlbum.songs.map((song, index) => (
                              <motion.div
                                key={song.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
                              >
                                <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                                  {index + 1}
                                </span>
                                <Input
                                  placeholder="Track title"
                                  value={song.title}
                                  onChange={(e) =>
                                    updateSongInAlbum(song.id, {
                                      title: e.target.value,
                                    })
                                  }
                                  className="flex-1 bg-white/5 border-white/10 focus:border-primary"
                                />
                                <div className="flex items-center gap-2">
                                  <Input
                                    placeholder="0:00"
                                    value={song.duration}
                                    onChange={(e) =>
                                      updateSongInAlbum(song.id, {
                                        duration: e.target.value,
                                      })
                                    }
                                    className="w-20 bg-white/5 border-white/10 focus:border-primary text-center"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      updateSongInAlbum(song.id, {
                                        explicit: !song.explicit,
                                      })
                                    }
                                    className={cn(
                                      "text-xs",
                                      song.explicit
                                        ? "text-red-400"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    E
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeSongFromAlbum(song.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                              <Music className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground mb-2">
                              No tracks added yet
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={addSongToAlbum}
                              className="bg-white/5 border-white/10 hover:bg-white/10"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add First Track
                            </Button>
                          </div>
                        )}
                      </ScrollArea>

                      <div className="flex justify-end mt-6 pt-6 border-t border-white/10">
                        <Button
                          onClick={handlePublishAlbum}
                          disabled={
                            isSaving ||
                            !newAlbum.title ||
                            !newAlbum.releaseDate ||
                            newAlbum.songs.length === 0
                          }
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Publish Album
                        </Button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Your Releases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artistAlbums.map((album) => (
                <motion.div
                  key={album.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 group"
                >
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {album.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(album.releaseDate).getFullYear()} • {album.totalTracks} tracks • {albumStats[album.id] || 0} streams
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="secondary"
                        className="bg-green-500/20 text-green-400 border-0"
                      >
                        Published
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-white/10"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-white/10"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}