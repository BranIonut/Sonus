import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from './glass-card';
import type { User } from '..//types/music';
import { getUserAvatar, getFallbackAvatarUrl } from '@/lib/utils';

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(num);
};

interface UserCardProps {
  user: User;
  variant?: 'grid' | 'compact' | 'profile';
}

export function UserCard({ user, variant = 'grid' }: UserCardProps) {

  console.log("User Data:", user);

  if (variant === 'profile') {
    return (
      <GlassCard variant="card" className="p-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-primary/20">
              <img
                src={getUserAvatar(user.userId)}
                alt={user.username}
                className="object-cover w-full h-full"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackAvatarUrl(); }}
              />
            </div>
            {user.hasActiveSubscription && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent flex items-center justify-center glow-accent">
                <Crown className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">{user.username}</h2>
              {user.hasActiveSubscription && (
                <span className="px-2 py-0.5 text-xs font-medium bg-accent/20 text-accent rounded-full">
                  Premium
                </span>
              )}
            </div>
            <p className="text-muted-foreground mb-3">@{user.username}</p>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="font-semibold">{formatNumber(user.followers || 0)}</span>
                <span className="text-muted-foreground ml-1">Followers</span>
              </div>
              <div>
                <span className="font-semibold">{formatNumber(user.following || 0)}</span>
                <span className="text-muted-foreground ml-1">Following</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/user/${user.userId}`}>
        <motion.div 
          className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
          whileHover={{ x: 2 }}
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <img src={getUserAvatar(user.userId)} alt={user.username} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackAvatarUrl(); }} />
            {user.hasActiveSubscription && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                <Crown className="w-2.5 h-2.5" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/user/${user.userId}`}>
      <GlassCard variant="card" hover className="group p-4 text-center">
        <div className="relative mx-auto w-20 h-20 mb-3">
          <div className="w-full h-full rounded-full overflow-hidden">
            <img
              src={getUserAvatar(user.userId)}
              alt={user.username}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackAvatarUrl(); }}
            />
          </div>
          {user.hasActiveSubscription && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center glow-accent">
              <Crown className="w-3 h-3" />
            </div>
          )}
        </div>
        <h3 className="font-medium truncate text-sm">{user.name}</h3>
        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
        {user.followers !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            {formatNumber(user.followers)} followers
          </p>
        )}
      </GlassCard>
    </Link>
  );
}