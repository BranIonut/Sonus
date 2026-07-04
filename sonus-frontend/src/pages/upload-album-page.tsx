'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Image } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  ImagePlus,
  Music,
  Plus,
  Trash2,
  GripVertical,
  Play,
  Pause,
  Clock,
  Disc3,
  Calendar,
  Building2,
  Tag,
  Save,
  Eye,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlassCard } from '@/components/glass-card';
import { cn } from '@/lib/utils';
import { CatalogService, ReleaseType } from '@/api/catalog-api';
import { UploadContentService } from '@/api/upload-content-api';
import { ArtistService } from '@/api/artist-api';
import { useUserStore } from '@/lib/store';
import { invalidateArtistCache } from '@/lib/api';

type TrackStatus = 'idle' | 'uploading' | 'completed' | 'error';

interface TrackUpload {
  id: string;
  songId?: string;
  file: File | null;
  title: string;
  durationSeconds: number;
  isExplicit: boolean;
  features: string;
  previewUrl?: string;
  status: TrackStatus;
  progress: number;
  error?: string;
}

const genres = [
  'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Jazz', 'Classical',
  'Country', 'Folk', 'Indie', 'Metal', 'Punk', 'Soul', 'Funk', 'Reggae',
  'Blues', 'Latin', 'World', 'Ambient', 'Experimental'
];

const albumTypes = [
  { value: 'album', label: 'Album' },
  { value: 'ep', label: 'EP' },
  { value: 'single', label: 'Single' },
];

function readAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {

    const url = URL.createObjectURL(file);
    const audio = new Audio(url);

    audio.addEventListener('loadedmetadata', () => {
      const total = Math.floor(audio.duration);
      URL.revokeObjectURL(url);
      resolve(total);
    });
    audio.addEventListener('error', () => {
      resolve(0);
      URL.revokeObjectURL(url);
    });
  });

}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

function getFileExtension(file: File): string {
  const parts = file.name.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export default function AlbumUploadPage() {

  const navigate = useNavigate();

  const user = useUserStore((state) => state.user);
  const artistId = user?.userId || '';

  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [albumType, setAlbumType] = useState('album');
  const [genre, setGenre] = useState('');
  const [secondaryGenre, setSecondaryGenre] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [recordLabel, setRecordLabel] = useState('');
  const [copyright, setCopyright] = useState('');

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isDraggingCover, setIsDraggingCover] = useState(false);

  const [tracks, setTracks] = useState<TrackUpload[]>([]);
  const [isDraggingTracks, setIsDraggingTracks] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'error' | 'success'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const tracksInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleCoverSelect = (file: File) => {
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleCoverDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCover(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleCoverSelect(file);
  }, []);

  const handleCoverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCoverSelect(file);
  };

  const handleTracksDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingTracks(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith('audio/') || /\.(mp3|wav|flac|m4a)$/i.test(f.name),
    );
    addTracks(files);
  }, []);

  const handleTracksSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addTracks(files);
  };

  const addTracks = async (files: File[]) => {
    const newTracks: TrackUpload[] = await Promise.all(
      files.map(async (file, index) => ({
        id: `track-${Date.now()}-${index}`,
        file,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        durationSeconds: await readAudioDuration(file),
        isExplicit: false,
        features: '',
        previewUrl: URL.createObjectURL(file),
        status: 'idle' as TrackStatus,
        progress: 0,
      }))
    );
    setTracks(prev => [...prev, ...newTracks]);
  };

  const removeTrack = (id: string) => {
    setTracks(prev => prev.filter(t => t.id !== id));
    if (currentPlayingId === id) {
      setCurrentPlayingId(null);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  const updateTrack = (id: string, updates: Partial<TrackUpload>) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const togglePlayTrack = (track: TrackUpload) => {
    if (!track.previewUrl || !audioRef.current) return;

    if (currentPlayingId === track.id) {
      audioRef.current.pause();
      setCurrentPlayingId(null);
    } else {
      audioRef.current.src = track.previewUrl;
      audioRef.current.play();
      setCurrentPlayingId(track.id);
    }
  };

  const handleSave = async (publish: boolean = false) => {

    if (!albumTitle || tracks.length === 0) return;

    setIsSaving(true);
    setSubmitStatus('submitting');
    setSubmitError(null);

    try {
      try {
        await ArtistService.updateArtistProfile(artistId, {
          stageName: user?.name || user?.username || 'Artist',
        });
        invalidateArtistCache();
      } catch (profileErr) {
        console.warn('Could not upsert artist profile before upload:', profileErr);
      }

      const album = await CatalogService.createAlbum(artistId, {
        title: albumTitle,
        description: albumDescription,
        type: albumType.toUpperCase() as ReleaseType,
        genre,
        releaseDate: releaseDate
          ? new Date(releaseDate).toISOString()
          : new Date().toISOString(),
        recordLabel,
        copyright,
      });

      const albumId = album.albumId;
      if (!albumId) throw new Error('Album creation failed, no ID returned.');

      if (coverImage) {
        await UploadContentService.uploadCoverArt(artistId, albumId, coverImage, (progress) => {
          console.log(`Cover upload progress: ${progress}%`);
        });

        await CatalogService.updateAlbumCover(albumId, albumId);
      }

      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];

        if (!track.file) continue;

        updateTrack(track.id, { status: 'uploading', progress: 0 });

        try {

          const { songId, presignedUrl } = await UploadContentService.initTrackUpload(
            artistId,
            albumId,
            getFileExtension(track.file)
          );

          await UploadContentService.putFileToMinIO(presignedUrl, track.file, (progress) => {
            updateTrack(track.id, { progress: progress });
          });

          const savedMetadata = await UploadContentService.confirmTrackUpload(artistId, {
            songId,
            albumId,
            title: track.title,
            durationSeconds: track.durationSeconds,
            isExplicit: track.isExplicit,
            features: track.features,
            trackNumber: i + 1
          });

          await CatalogService.addSongToAlbum(artistId, albumId, {
            songId: songId,
            title: track.title,
            durationSeconds: track.durationSeconds,
            objectKey: savedMetadata.objectKey
          });

          updateTrack(track.id, { status: 'completed', songId });

        } catch (error) {
          updateTrack(track.id, {
            status: 'error',
            error: 'Failed to upload track. Please try again.'
          });
        }
      }

      setSubmitStatus('success');
      invalidateArtistCache();
      toast.success(publish ? 'Album published successfully!' : 'Draft saved successfully!');
      if (publish) {
        setTimeout(() => navigate(`/artist/${artistId}`), 2000);
      }

    } catch (error) {
      setSubmitError('Failed to create album. Please try again.');
      setSubmitStatus('error');
      toast.error('Failed to create album. Please try again.');
    } finally {
      setIsSaving(false);
    }

  };

  const totalDuration = tracks.reduce((acc, t) => {
    const [mins, secs] = formatDuration(t.durationSeconds).split(':').map(Number);
    return acc + (mins || 0) * 60 + (secs || 0);
  }, 0);

  const formatTotalDuration = () => {
    const hours = Math.floor(totalDuration / 3600);
    const mins = Math.floor((totalDuration % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} min`;
  };

  return (
    <div className="min-h-screen pb-32">
      <audio ref={audioRef} onEnded={() => setCurrentPlayingId(null)} />

      <div className="sticky top-0 z-20 glass-heavy border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Link to="/artist/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Upload New Album</h1>
              <p className="text-sm text-muted-foreground">
                {tracks.length} tracks {tracks.length > 0 && `· ${formatTotalDuration()}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="glass"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              className="glow-primary"
              onClick={() => handleSave(true)}
              disabled={isSaving || !albumTitle || tracks.length === 0}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isSaving ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <GlassCard variant="card" className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-primary" />
                Cover Art
              </h2>

              <div
                className={cn(
                  'relative aspect-square rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer',
                  isDraggingCover ? 'border-primary bg-primary/10' : 'border-white/20 hover:border-primary/50',
                  coverImage && 'border-solid border-transparent'
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
                onDragLeave={() => setIsDraggingCover(false)}
                onDrop={handleCoverDrop}
                onClick={() => coverInputRef.current?.click()}
              >
                {coverImage ? (
                  <>
                    <img
                      src={coverPreview as string}
                      alt="Album cover"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-sm text-white">Click to change</p>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <Upload className="w-10 h-10 mb-2" />
                    <p className="text-sm font-medium">Drop cover image here</p>
                    <p className="text-xs">or click to browse</p>
                    <p className="text-xs mt-2 text-muted-foreground/60">
                      3000x3000 recommended
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverInputChange}
              />
            </GlassCard>

            <GlassCard variant="card" className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Release Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Release Date
                  </label>
                  <Input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="glass"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Record Label
                  </label>
                  <Input
                    placeholder="Independent or label name"
                    value={recordLabel}
                    onChange={(e) => setRecordLabel(e.target.value)}
                    className="glass"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Copyright
                  </label>
                  <Input
                    placeholder="© 2024 Your Name"
                    value={copyright}
                    onChange={(e) => setCopyright(e.target.value)}
                    className="glass"
                  />
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard variant="card" className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Disc3 className="w-5 h-5 text-primary" />
                Album Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Album Title *
                  </label>
                  <Input
                    placeholder="Enter album title"
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    className="glass text-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Type
                  </label>
                  <Select value={albumType} onValueChange={setAlbumType}>
                    <SelectTrigger className="glass">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {albumTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Description
                  </label>
                  <Textarea
                    placeholder="Tell listeners about this album..."
                    value={albumDescription}
                    onChange={(e) => setAlbumDescription(e.target.value)}
                    className="glass min-h-[120px] resize-none"
                  />
                </div>
              </div>
            </GlassCard>

            <GlassCard variant="card" className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Genre & Style
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Primary Genre *
                  </label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger className="glass">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map(g => (
                        <SelectItem key={g} value={g.toLowerCase()}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Secondary Genre
                  </label>
                  <Select value={secondaryGenre} onValueChange={setSecondaryGenre}>
                    <SelectTrigger className="glass">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map(g => (
                        <SelectItem key={g} value={g.toLowerCase()}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </GlassCard>
          </div>

          <div>
            <GlassCard variant="card" className="p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Music className="w-5 h-5 text-primary" />
                  Tracks
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => tracksInputRef.current?.click()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              <div
                className={cn(
                  'border-2 border-dashed rounded-xl p-4 mb-4 transition-all',
                  isDraggingTracks ? 'border-primary bg-primary/10' : 'border-white/20',
                  tracks.length === 0 && 'min-h-[200px] flex items-center justify-center'
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingTracks(true); }}
                onDragLeave={() => setIsDraggingTracks(false)}
                onDrop={handleTracksDrop}
              >
                {tracks.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Drop audio files here</p>
                    <p className="text-xs">MP3, WAV, FLAC supported</p>
                  </div>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={tracks}
                    onReorder={setTracks}
                    className="space-y-2"
                  >
                    <AnimatePresence>
                      {tracks.map((track, index) => (
                        <Reorder.Item
                          key={track.id}
                          value={track}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className="glass rounded-lg p-3"
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm text-muted-foreground w-6">
                                {index + 1}
                              </span>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-full flex-shrink-0"
                                onClick={() => togglePlayTrack(track)}
                              >
                                {currentPlayingId === track.id ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>

                              <div className="flex-1 min-w-0 space-y-2">
                                <Input
                                  value={track.title}
                                  onChange={(e) => updateTrack(track.id, { title: e.target.value })}
                                  className="glass text-sm font-medium h-8"
                                  placeholder="Track title"
                                />
                                <Input
                                  value={track.features}
                                  onChange={(e) => updateTrack(track.id, { features: e.target.value })}
                                  className="glass text-xs h-7 text-muted-foreground"
                                  placeholder="feat. Artist Name"
                                />
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(track.durationSeconds)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-7 h-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeTrack(track.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="mt-2 flex items-center gap-4 ml-14">
                              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={track.isExplicit}
                                  onChange={(e) => updateTrack(track.id, { isExplicit: e.target.checked })}
                                  className="rounded border-white/20"
                                />
                                Explicit
                              </label>
                            </div>
                          </motion.div>
                        </Reorder.Item>
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
                )}
              </div>

              <input
                ref={tracksInputRef}
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                onChange={handleTracksSelect}
              />

              {tracks.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total tracks</span>
                    <span className="font-medium">{tracks.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Total duration</span>
                    <span className="font-medium">{formatTotalDuration()}</span>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}