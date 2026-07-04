import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Share2, UserPlus, UserCheck, Crown, Users, Upload } from 'lucide-react';
import { Button } from '../components/ui/button';
import { PlaylistCard } from '../components/playlist-card';
import { SectionHeader } from '../components/section-header';
import { useUserPlaylists } from '../lib/api';
import { useUserStore } from '../lib/store';
import { useEffect, useState } from 'react';
import { AuthService } from '../api/auth-api';
import { User } from '@/types/music';
import { toast } from 'sonner';
import { LibraryService } from '../api/user-library-api';
import { GlassCard } from '../components/glass-card';
import { getUserAvatar, getFallbackAvatarUrl, formatNumber } from '../lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function UserPage() {
  const navigate = useNavigate();
  const { userId: id } = useParams<{ userId: string }>();
  const currentUser = useUserStore((state) => state.user);
  const isOwnProfile = currentUser?.userId === id;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const { data: playlists } = useUserPlaylists(id || '');

  const handleFollowToggle = async () => {
    try {
      if (id) await LibraryService.toggleFollowUser(id);
      setIsFollowing((prev) => !prev);
      setProfileUser(prev => prev ? { 
          ...prev, 
          followers: (prev.followers || 0) + (isFollowing ? -1 : 1) 
      } : null);
      toast.success(
        isFollowing
          ? `Unfollowed ${profileUser?.name}`
          : `Now following ${profileUser?.name}`
      );
    } catch (e) {
      console.error(e);
      toast.error('Failed to update follow status');
    }
  };

  useEffect(() => {
    if (id) {
      LibraryService.getMyLibrary()
        .then((library) => setIsFollowing(library.followedUsers?.includes(id) || false))
        .catch(console.error);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        let baseProfile;
        if (isOwnProfile && currentUser) {
          baseProfile = currentUser;
        } else {
          baseProfile = await AuthService.getUserProfile(id);
        }
        
        try {
            const [followers, following] = await Promise.all([
                LibraryService.getUserFollowerCount(id),
                LibraryService.getUserFollowingCount(id)
            ]);
            setProfileUser({ ...baseProfile, followers, following });
        } catch (err) {
            console.error("Failed to fetch followers", err);
            setProfileUser(baseProfile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setProfileUser(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [id, isOwnProfile, currentUser]);

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <h2>User not found</h2>
      </div>
    );
  }

  const publicPlaylists = playlists?.filter((p) => p.isPublic || isOwnProfile);

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

      <motion.div variants={itemVariants}>
        <GlassCard variant="card" className="relative overflow-hidden">

          <div className="absolute inset-0">
            <img
              src={getUserAvatar(profileUser.userId)}
              alt=""
              className="w-full h-full object-cover blur-2xl opacity-30 scale-110"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackAvatarUrl(); }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>

          <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-end gap-6">

            <motion.div
              className="relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden shadow-2xl flex-shrink-0 ring-4 ring-primary/20"
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={getUserAvatar(profileUser.userId)}
                alt={profileUser.username}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackAvatarUrl(); }}
              />
              {profileUser.hasActiveSubscription && (
                <div className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-accent flex items-center justify-center shadow-lg">
                  <Crown className="w-5 h-5" />
                </div>
              )}
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm text-muted-foreground">Profile</p>
                {profileUser.hasActiveSubscription && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-accent/20 text-accent rounded-full">
                    Premium
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-3">
                {profileUser.name || profileUser.username}
              </h1>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold text-foreground">
                    {formatNumber(profileUser.followers || 0)}
                  </span>
                  <span>followers</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">
                    {formatNumber(profileUser.following || 0)}
                  </span>
                  <span className="ml-1">following</span>
                </div>
                {publicPlaylists && publicPlaylists.length > 0 && (
                  <div>
                    <span className="font-semibold text-foreground">{publicPlaylists.length}</span>
                    <span className="ml-1">public playlists</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-3 flex-wrap">
        {isOwnProfile ? (
          <>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full glass"
              onClick={() => navigate('/settings/account')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            {currentUser?.role === 'ARTIST' && (
              <Button
                variant="outline"
                size="lg"
                className="rounded-full glass"
                onClick={() => navigate('/artist/upload')}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Content
              </Button>
            )}
          </>
        ) : (
          <Button
            size="lg"
            variant={isFollowing ? 'outline' : 'default'}
            className={`rounded-full ${isFollowing ? 'glass' : ''}`}
            onClick={handleFollowToggle}
          >
            {isFollowing
              ? <><UserCheck className="w-4 h-4 mr-2" />Following</>
              : <><UserPlus className="w-4 h-4 mr-2" />Follow</>}
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() =>
            window.navigator.clipboard
              .writeText(window.location.href)
              .then(() => toast.success('Profile URL copied to clipboard'))
          }
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </motion.div>

      {publicPlaylists && publicPlaylists.length > 0 && (
        <motion.section variants={itemVariants}>
          <SectionHeader title={isOwnProfile ? 'Your Playlists' : 'Public Playlists'} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {publicPlaylists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </motion.section>
      )}

      {(!publicPlaylists || publicPlaylists.length === 0) && (
        <motion.div
          variants={itemVariants}
          className="text-center py-12 text-muted-foreground"
        >
          <p>No public playlists yet</p>
        </motion.div>
      )}
    </motion.div>
  );
}