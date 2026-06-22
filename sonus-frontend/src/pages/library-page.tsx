'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Grid, List, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GlassCard } from '@/components/glass-card';
import { PlaylistCard } from '@/components/playlist-card';
import { AlbumCard } from '@/components/album-card';
import { ArtistCard } from '@/components/artist-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlaylists, useAlbums, useArtists } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'creator'>('recent');
  const navigate = useNavigate();

  const { data: playlists } = usePlaylists();
  const { data: albums } = useAlbums();
  const { data: artists } = useArtists();

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-bold">Your Library</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="glass">
                <Filter className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-heavy">
              <DropdownMenuItem onClick={() => setSortBy('recent')}>
                Recently Added
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('creator')}>
                Creator
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center glass rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="w-8 h-8"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="w-8 h-8"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="playlists" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="artists">Artists</TabsTrigger>
          </TabsList>

          <TabsContent value="playlists" className="space-y-4">

            <GlassCard variant="card" hover className="p-4 cursor-pointer" onClick={() => navigate('/playlist/create')}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Create Playlist</h3>
                  <p className="text-sm text-muted-foreground">
                    Build your perfect collection
                  </p>
                </div>
              </div>
            </GlassCard>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {playlists?.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {playlists?.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} variant="large" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="albums">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {albums?.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {albums?.map((album) => (
                  <AlbumCard key={album.id} album={album} variant="compact" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="artists">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {artists?.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {artists?.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} variant="compact" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}