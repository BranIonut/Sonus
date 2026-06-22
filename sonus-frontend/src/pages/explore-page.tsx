'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/glass-card';
import { SongCard } from '@/components/song-card';
import { AlbumCard } from '@/components/album-card';
import { ArtistCard } from '@/components/artist-card';
import { PlaylistCard } from '@/components/playlist-card';
import { SectionHeader } from '@/components/section-header';
import { useSearch, useAlbums, useArtists, usePlaylists, useRecommendations, useTopArtist, useRecommendedArtistsAndAlbums } from '@/lib/api';
import { useUserStore } from '@/lib/store';
import { useEffect } from 'react';

const genres = [
  { name: 'Electronic', color: 'from-primary/40 to-primary/10' },
  { name: 'Ambient', color: 'from-accent/40 to-accent/10' },
  { name: 'Synthwave', color: 'from-chart-3/40 to-chart-3/10' },
  { name: 'Lo-Fi', color: 'from-chart-4/40 to-chart-4/10' },
  { name: 'Chillwave', color: 'from-chart-5/40 to-chart-5/10' },
  { name: 'Dream Pop', color: 'from-primary/30 to-accent/20' },
];

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [visibleTrendingArtists, setVisibleTrendingArtists] = useState(10);
  const [visiblePopularAlbums, setVisiblePopularAlbums] = useState(12);

  const [visibleSearchArtists, setVisibleSearchArtists] = useState(10);
  const [visibleSearchAlbums, setVisibleSearchAlbums] = useState(12);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const { data: searchResults, isLoading: isSearchLoading } = useSearch(debouncedQuery);
  const { data: albums } = useAlbums();
  const { data: artists } = useArtists();
  const { data: playlists } = usePlaylists();

  const { user } = useUserStore();
  const { data: recommendedSongs } = useRecommendations(user?.userId);
  const { data: topArtist } = useTopArtist(user?.userId);
  const { data: recData } = useRecommendedArtistsAndAlbums(topArtist || null);

  console.log("Recommended songs: ", recommendedSongs);
  console.log("Top artist: ", topArtist);
  console.log("Rec data: ", recData);

  const isSearching = debouncedQuery.trim().length > 0;
  const isLoadingResults = isSearching && isSearchLoading;

  const hasResults = !!searchResults && (
    (searchResults.songs?.length ?? 0) > 0 ||
    (searchResults.albums?.length ?? 0) > 0 ||
    (searchResults.artists?.length ?? 0) > 0 ||
    (searchResults.playlists?.length ?? 0) > 0
  );
  const hasNoResults = isSearching && !isLoadingResults && !hasResults;

  return (
    <div
      className="space-y-8"

    >

      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Explore</h1>
        <GlassCard variant="card" className="p-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search songs, artists, albums..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-12 py-6 bg-transparent border-0 text-lg focus-visible:ring-0"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setQuery('')}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </GlassCard>
      </div>

      {hasResults ? (
        <div>
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="glass">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="songs">Songs</TabsTrigger>
              <TabsTrigger value="albums">Albums</TabsTrigger>
              <TabsTrigger value="artists">Artists</TabsTrigger>
              <TabsTrigger value="playlists">Playlists</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {searchResults?.songs.length > 0 && (
                <section>
                  <SectionHeader title="Songs" />
                  <GlassCard variant="card" className="p-2">
                    {searchResults.songs.slice(0, 5).map((song, index) => (
                      <SongCard key={song.id} song={song} index={index} />
                    ))}
                  </GlassCard>
                </section>
              )}

              {searchResults?.artists.length > 0 && (
                <section className="relative pb-16">
                  <SectionHeader title="Artists" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {searchResults.artists.slice(0, visibleSearchArtists).map((artist) => (
                      <ArtistCard key={artist.id} artist={artist} />
                    ))}
                  </div>

                  {searchResults.artists.length > 5 && (
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 mt-4">
                      {visibleSearchArtists < searchResults.artists.length && (
                        <Button variant="ghost" className="font-semibold glow-primary" onClick={() => setVisibleSearchArtists(prev => prev + 10)}>
                          Show More
                        </Button>
                      )}
                      {visibleSearchArtists > 10 && (
                        <Button variant="ghost" className="font-semibold glass" onClick={() => setVisibleSearchArtists(10)}>
                          Show Less
                        </Button>
                      )}
                    </div>
                  )}
                </section>
              )}

              {searchResults?.albums.length > 0 && (
                <section className="relative pb-16">
                  <SectionHeader title="Albums" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {searchResults.albums.slice(0, visibleSearchAlbums).map((album) => (
                      <AlbumCard key={album.id} album={album} />
                    ))}
                  </div>

                  {searchResults.albums.length > 12 && (
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 mt-4">
                      {visibleSearchAlbums < searchResults.albums.length && (
                        <Button variant="ghost" className="font-semibold glow-primary" onClick={() => setVisibleSearchAlbums(prev => prev + 12)}>
                          Show More
                        </Button>
                      )}
                      {visibleSearchAlbums > 12 && (
                        <Button variant="ghost" className="font-semibold glass" onClick={() => setVisibleSearchAlbums(12)}>
                          Show Less
                        </Button>
                      )}
                    </div>
                  )}
                </section>
              )}

              {searchResults?.playlists.length > 0 && (
                <section>
                  <SectionHeader title="Playlists" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchResults.playlists.map((playlist) => (
                      <PlaylistCard key={playlist.id} playlist={playlist} />
                    ))}
                  </div>
                </section>
              )}
            </TabsContent>

            <TabsContent value="songs">
              <GlassCard variant="card" className="p-2">
                {searchResults?.songs.map((song, index) => (
                  <SongCard key={song.id} song={song} index={index} />
                ))}
              </GlassCard>
            </TabsContent>

            <TabsContent value="albums">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {searchResults?.albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="artists">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {searchResults?.artists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="playlists">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults?.playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : isLoadingResults ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Searching...</p>
        </div>
      ) : hasNoResults ? (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">No results found for "{debouncedQuery}"</p>
        </div>
      ) : (
        <>

          {user && recommendedSongs && recommendedSongs.length > 0 && (
            <section>
              <SectionHeader title="Made For You" />
              <GlassCard variant="card" className="p-2">
                {recommendedSongs.slice(0, 5).map((song, index) => (
                  <SongCard key={song.id} song={song} index={index} />
                ))}
              </GlassCard>
            </section>
          )}

          {topArtist && recData && recData.recArtists.length > 0 && (
            <section className="relative pb-4">
              <SectionHeader title={`Because you like ${topArtist.name}`} />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {recData.recArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}

          {topArtist && recData && recData.recAlbums.length > 0 && (
            <section className="relative pb-4">
              <SectionHeader title={`More ${topArtist.genres?.[0] || 'Similar'} Albums`} />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {recData.recAlbums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </section>
          )}

          <section className="relative pb-16">
            <SectionHeader title="Trending Artists" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {artists?.slice(0, visibleTrendingArtists).map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
            {artists && artists.length > 5 && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 mt-4">
                {visibleTrendingArtists < artists.length && (
                  <Button variant="ghost" className="font-semibold glow-primary" onClick={() => setVisibleTrendingArtists(prev => prev + 10)}>
                    Show More
                  </Button>
                )}
                {visibleTrendingArtists > 5 && (
                  <Button variant="ghost" className="font-semibold glass" onClick={() => setVisibleTrendingArtists(10)}>
                    Show Less
                  </Button>
                )}
              </div>
            )}
          </section>

          <section className="relative pb-16">
            <SectionHeader title="Popular Albums" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {albums?.slice(0, visiblePopularAlbums).map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
            {albums && albums.length > 12 && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 mt-4">
                {visiblePopularAlbums < albums.length && (
                  <Button variant="ghost" className="font-semibold glow-primary" onClick={() => setVisiblePopularAlbums(prev => prev + 12)}>
                    Show More
                  </Button>
                )}
                {visiblePopularAlbums > 12 && (
                  <Button variant="ghost" className="font-semibold glass" onClick={() => setVisiblePopularAlbums(12)}>
                    Show Less
                  </Button>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}