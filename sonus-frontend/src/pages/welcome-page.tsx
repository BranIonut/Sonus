'use client';

import { useEffect, useState, useMemo } from 'react';
import { Music2, Play, Sparkles, Headphones, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/glass-card';
import { CatalogService } from '@/api/catalog-api';
import { getAlbumCoverUrl } from '@/lib/utils';

const features = [
  {
    icon: Headphones,
    title: 'Immersive Sound',
    description: 'Crystal clear audio quality with lossless streaming',
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    description: 'AI-powered playlists tailored to your taste',
  },
  {
    icon: Radio,
    title: 'Live Sessions',
    description: 'Exclusive live performances from your favorite artists',
  },
];

const fallbackCoverIds = [
  '6a181fb7cf317d9cf5d174ca', '6a181fb7cf317d9cf5d174a4', '6a181fb7cf317d9cf5d174cf',
  '6a181fb7cf317d9cf5d174e0', '6a181fb7cf317d9cf5d17439', '6a181fb7cf317d9cf5d1749f',
  '6a181fb7cf317d9cf5d1742f', '6a181fb7cf317d9cf5d1746c', '6a181fb7cf317d9cf5d17540'
];

export default function WelcomePage() {
  const [covers, setCovers] = useState<string[]>([]);

  useEffect(() => {
    CatalogService.getAllAlbums(undefined, 0, 50)
      .then(albums => {
        let urls = albums
          .map(a => a.coverUrl ? getAlbumCoverUrl(a.coverUrl) : null)
          .filter(Boolean) as string[];
          
        if (urls.length === 0) {
          urls = fallbackCoverIds.map(id => `http://localhost:9040/storage/album-covers/${id}.png`);
        }

        let pool = [...urls];
        while (pool.length < 15) {
          pool = [...pool, ...urls];
        }
        setCovers(pool);
      })
      .catch(err => {
        console.error("Failed to fetch albums for welcome page", err);
        setCovers(fallbackCoverIds.map(id => `http://localhost:9040/storage/album-covers/${id}.png`));
      });
  }, []);

  const columns = useMemo(() => {
    if (covers.length === 0) return [];
    
    return Array.from({ length: 8 }).map(() => {
      const shuffled = [...covers].sort(() => Math.random() - 0.5);
      const selection = shuffled.slice(0, 15); 
      return [...selection, ...selection];
    });
  }, [covers]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">

      <div className="absolute inset-0 z-0 flex justify-center gap-4 opacity-20 pointer-events-none transform scale-125 -rotate-[8deg] select-none">
        {columns.map((col, i) => (
          <div
            key={i}
            className={`flex flex-col gap-4 w-32 md:w-48 shrink-0 ${i % 2 === 0 ? 'animate-scroll-up' : 'animate-scroll-down'
              }`}
          >
            {col.map((url, j) => (
              <div key={j} className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl shrink-0">
                <img
                  src={url}
                  alt="Cover"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-0 pointer-events-none"></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12 fade-in">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Music2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 drop-shadow-sm">
              Sonus
            </span>
          </div>
        </div>

        <div className="text-center mb-12 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground drop-shadow-md">
            Feel the Music
          </h1>
          <p className="text-xl text-muted-foreground drop-shadow-sm">
            Discover, stream, and share a constantly expanding mix of music
            from emerging and major artists around the world.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link to="/explore">
            <Button size="lg" className="text-lg px-8 rounded-full shadow-lg shadow-primary/40">
              <Play className="w-5 h-5 mr-2 fill-current" />
              Start Listening
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="lg" variant="outline" className="text-lg px-8 rounded-full bg-background/40 backdrop-blur-md border-white/10 hover:bg-background/60">
              Sign Up Free
            </Button>
          </Link>
        </div>

        <p className="mt-12 text-sm text-muted-foreground bg-background/20 backdrop-blur-sm px-4 py-1 rounded-full">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}