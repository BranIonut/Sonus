'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  Library,
  PlusCircle,
  Heart,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Music2,
  LogIn,
} from 'lucide-react';
import { cn, getUserAvatar, getArtistImageUrl, getFallbackAvatarUrl } from '../lib/utils';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { GlassCard } from './glass-card';
import { PlaylistCard } from './playlist-card';
import { useUIStore, useUserStore, usePlayerStore } from '../lib/store';
import { usePlaylists, useArtists } from '../lib/api';
import { Link, useLocation } from 'react-router-dom';

const mainNavItems = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: Search, label: 'Explore', to: '/explore' },
  { icon: Library, label: 'Library', to: '/library' },
];

const libraryItems = [
  { icon: Heart, label: 'Liked Songs', to: '/liked' },
  { icon: Clock, label: 'Recently Played', to: '/recent' },
];

export function AppSidebar() {
  const pathname = useLocation().pathname;
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { data: playlists } = usePlaylists();
  const { data: allArtists } = useArtists();
  const currentUser = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const userId = useUserStore((state) => state.user?.userId);
  const followedArtists = useUserStore((state) => state.followedArtists);
  const [showAllPlaylists, setShowAllPlaylists] = useState(false);
  const currentSong = usePlayerStore((state) => state.currentSong);

  const likedArtists = allArtists?.filter((a) => followedArtists.includes(a.id)) ?? [];
  const displayedLikedArtists = likedArtists.slice(0, 4);

  console.log("User ID in sidebar:", userId);

  const displayedPlaylists = showAllPlaylists
    ? playlists
    : playlists?.slice(0, 4);

  return (
    <>

      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 90 }}
        transition={{ duration: 0.2 }}
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30 h-screen"
      >

        <div className={cn("flex flex-col gap-2 p-3 h-full overflow-hidden transition-all duration-300", currentSong ? "pb-[100px]" : "")}>

          <GlassCard variant="card" className="p-4 flex-shrink-0">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-primary">
                <Music2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-bold text-xl text-gradient"
                  >
                    Sonus
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </GlassCard>

          <GlassCard variant="card" className="p-2 flex-shrink-0">
            <nav className="flex flex-col gap-1">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.to;
                return (
                  <Link key={item.to} to={item.to}>
                    <motion.div
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                        isActive
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                      )}
                      whileHover={{ x: 2 }}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="font-medium"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
          </GlassCard>

          <GlassCard variant="card" className="flex-1 min-h-0 overflow-hidden flex flex-col p-2">
            {sidebarOpen && (
              <div className="flex items-center justify-between px-3 py-2 flex-shrink-0">
                <span className="text-sm font-semibold text-muted-foreground">Your Library</span>
                <Link to="/playlist/create">
                  <Button variant="ghost" size="icon" className="w-7 h-7">
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}

            <div className="flex flex-col gap-1 mb-2 flex-shrink-0">
              {libraryItems.map((item) => {
                const isActive = pathname === item.to;
                return (
                  <Link key={item.to} to={item.to}>
                    <motion.div
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        isActive
                          ? 'bg-accent text-white'
                          : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                      )}
                      whileHover={{ x: 2 }}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {sidebarOpen && (
              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-4 pr-2 pb-2">

                  {likedArtists.length > 0 && (
                    <div>
                      <div className="px-3 py-1 mb-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Liked Artists
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {likedArtists.slice(0, 3).map((artist) => (
                          <Link key={artist.id} to={`/artist/${artist.id}`}>
                            <motion.div
                              className={cn(
                                'flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors',
                                pathname === `/artist/${artist.id}`
                                  ? 'bg-primary/20 text-primary'
                                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                              )}
                              whileHover={{ x: 2 }}
                            >
                              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-primary/20">
                                <img
                                  src={getUserAvatar(artist.id)}
                                  alt={artist.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackAvatarUrl(); }}
                                />
                              </div>
                              <span className="text-sm truncate">{artist.name}</span>
                            </motion.div>
                          </Link>
                        ))}
                        <Link to="/liked-artists">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-muted-foreground hover:text-foreground h-7 mt-0.5"
                          >
                            {likedArtists.length > 3
                              ? `+${likedArtists.length - 3} more artists`
                              : 'See all liked artists'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {playlists && playlists.length > 0 && (
                    <div>
                      <div className="px-3 py-1 mb-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Playlists
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {playlists.slice(0, 3).map((playlist) => (
                          <PlaylistCard
                            key={playlist.id}
                            playlist={playlist}
                            variant="compact"
                          />
                        ))}
                        {playlists.length > 3 && (
                          <Link to="/library">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs text-muted-foreground hover:text-foreground h-7 mt-0.5"
                            >
                              +{playlists.length - 3} more playlists
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </ScrollArea>
            )}
          </GlassCard>

          <GlassCard variant="card" className="p-2 flex-shrink-0">
            {isAuthenticated ? (
              <>
                <Link to="/settings">
                  <motion.div
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      pathname === '/settings'
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                    )}
                    whileHover={{ x: 2 }}
                  >
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-sm"
                        >
                          Settings
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>

                {currentUser && (
                  <Link to={currentUser.role === 'ARTIST' ? `/artist/${currentUser.userId}` : `/user/${currentUser.userId}`}>
                    <motion.div
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                      whileHover={{ x: 2 }}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={getUserAvatar(currentUser.userId)}
                          alt={currentUser.username}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackAvatarUrl(); }}
                        />
                      </div>
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm font-medium truncate"
                          >
                            {currentUser.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                )}
              </>
            ) : (
              <div className={cn('flex gap-2', sidebarOpen ? 'flex-row' : 'flex-col items-center')}>
                <Link to="/login" className={sidebarOpen ? 'flex-1' : ''}>
                  <motion.div
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    whileHover={{ x: 2 }}
                    title="Log in"
                  >
                    <LogIn className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-sm font-medium"
                        >
                          Log in
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1"
                    >
                      <Link to="/signup">
                        <Button
                          size="sm"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm"
                        >
                          Sign up
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </GlassCard>

        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full glass"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </motion.aside>

      <nav className={cn("md:hidden fixed left-0 right-0 z-30 px-4 transition-all duration-300", currentSong ? "bottom-[100px]" : "bottom-6")}>
        <GlassCard variant="heavy" className="flex items-center justify-around p-2">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link key={item.to} to={item.to}>
                <motion.div
                  className={cn(
                    'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
          {isAuthenticated ? (
            <Link to="/settings">
              <motion.div
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors',
                  pathname === '/settings' ? 'text-primary' : 'text-muted-foreground'
                )}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs">Settings</span>
              </motion.div>
            </Link>
          ) : (
            <Link to="/login">
              <motion.div
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-primary"
                whileTap={{ scale: 0.95 }}
              >
                <LogIn className="w-5 h-5" />
                <span className="text-xs font-semibold">Log in</span>
              </motion.div>
            </Link>
          )}
        </GlassCard>
      </nav>
    </>
  );
}