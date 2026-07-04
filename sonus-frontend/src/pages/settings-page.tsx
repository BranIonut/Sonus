'use client';

import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  Palette,
  Volume2,
  Wifi,
  Smartphone,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Slider } from '../components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { GlassCard } from '../components/glass-card';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { getUserAvatar } from '../lib/utils';
import { useUserStore } from '../lib/store';
import { usePlayerStore } from '../lib/store';
import { useTheme } from 'next-themes';
import { navigate } from 'next/dist/client/components/segment-cache/navigation';

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

export default function SettingsPage() {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  const { volume, setVolume } = usePlayerStore();
  const { logout } = useUserStore();
  const { theme, setTheme } = useTheme();

  return (
    <motion.div
      className="space-y-6 max-w-3xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </motion.div>

      <motion.section variants={itemVariants}>
        <GlassCard variant="card" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Account</h2>
          </div>

          {user && (
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src={getUserAvatar(user.userId)}
                  alt={user.username}
                  className="object-cover"
                />
                <AvatarFallback className="text-xl bg-primary/20">
                  {user.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                {user.hasActiveSubscription && (
                  <span className="text-xs text-accent">Premium Member</span>
                )}
              </div>
              <Button variant="outline" size="sm" className="ml-auto glass" onClick={() => navigate('/settings/account')}>
                Edit Profile
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <span>Email</span>
              <span className="text-muted-foreground text-medium">{user?.email}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <span>Subscription</span>
              <span className="text-accent">Premium</span>
            </div>
          </div>
        </GlassCard>
      </motion.section>

      <motion.section variants={itemVariants}>
        <GlassCard variant="card" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Playback</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Volume</span>
                <span className="text-muted-foreground text-sm">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <Slider
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={(v) => setVolume(v[0])}
              />
            </div>
          </div>
        </GlassCard>
      </motion.section>

      <motion.section variants={itemVariants}>
        <GlassCard variant="card" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Privacy</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p>Private Session</p>
                <p className="text-sm text-muted-foreground">
                  Your activity won&apos;t appear in any feeds
                </p>
              </div>
              <Switch />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p>Show Listening Activity</p>
                <p className="text-sm text-muted-foreground">
                  Let others see what you&apos;re listening to
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </GlassCard>
      </motion.section>

      <motion.section variants={itemVariants}>
        <GlassCard variant="card" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Appearance</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p>Theme</p>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-32 glass">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent className="glass-heavy">
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </GlassCard>
      </motion.section>

      <motion.section variants={itemVariants}>
        <Button
          variant="destructive"
          className="w-full"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </motion.section>

      <motion.div variants={itemVariants} className="text-center text-sm text-muted-foreground py-4">
        <p>Sonus Music v1.0.0</p>
      </motion.div>
    </motion.div>
  );
}