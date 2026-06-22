"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  User,
  Mail,
  CreditCard,
  Check,
  X,
  Sparkles,
  Crown,
  Upload,
  Pencil,
  Save,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "../components/glass-card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { cn, getUserAvatar } from "../lib/utils";
import { useUserStore } from "../lib/store";
import { AuthService } from "../api/auth-api";
import { UploadContentService } from "../api/upload-content-api";

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  hasActiveSubscription: boolean;
}

export default function UserAccountSettingsPage() {

  const navigate = useNavigate();

  const { user, setUser, logout } = useUserStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [editedProfile, setEditedProfile] = useState<UserProfile>({
    id: user?.userId || "",
    username: user?.username || "",
    name: user?.name || "",
    email: user?.email || "",
    hasActiveSubscription: user?.hasActiveSubscription || false
  } as UserProfile);

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload: { name?: string; email?: string; password?: string } = {};
      if (editedProfile.name && editedProfile.name !== user.name) payload.name = editedProfile.name;
      if (editedProfile.email && editedProfile.email !== user.email) payload.email = editedProfile.email;

      if (Object.keys(payload).length > 0) {
        const response = await AuthService.updateUserMetadata(user.userId, payload);
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
      }

      if (selectedAvatarFile) {
        await UploadContentService.uploadProfilePicture(user.userId, selectedAvatarFile);
      }

      const updatedUser = await AuthService.getUserProfile(user.userId);
      setUser({ ...user, ...updatedUser });

      setEditedProfile((prev) => ({ ...prev, password: "" }));
      setPreviewAvatar(null);
      setSelectedAvatarFile(null);
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message ?? "Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account? This cannot be undone."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await AuthService.deleteAccount(user.userId);
      logout();
      navigate('/login');
    } catch (err) {
      console.error("Failed to delete account:", err);
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(editedProfile);
    setPreviewAvatar(null);
    setIsEditing(false);
  };

  const handleSubscriptionToggle = async (enable: boolean) => {
    try {
      const response = await AuthService.updateSubscriptionStatus(user.userId, enable);
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        const validationInfo = await AuthService.validateToken(response.token);
        const updatedUser = await AuthService.getUserProfile(user.userId);

        setUser({
          ...updatedUser,
          userId: validationInfo.id,
          role: validationInfo.role,
          hasActiveSubscription: validationInfo.hasActiveSubscription
        });

        setEditedProfile(prev => ({
          ...prev,
          hasActiveSubscription: validationInfo.hasActiveSubscription
        }));
      }
    } catch (err) {
      console.error("Failed to update subscription:", err);
    }
  };

  const subscriptionPlans = [
    {
      type: "free",
      name: "Free",
      price: "$0",
      features: ["Ad-supported listening", "Basic audio quality", "Limited skips"],
      current: !user.hasActiveSubscription,
    },
    {
      type: "premium",
      name: "Premium",
      price: "$9.99/mo",
      features: ["Ad-free listening", "High quality audio", "Unlimited skips", "Offline mode"],
      current: user.hasActiveSubscription,
      popular: true,
    },
  ];

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile and subscription
        </p>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Information
          </h2>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="bg-white/5 border-white/10 hover:bg-white/10"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="bg-white/5 border-white/10 hover:bg-white/10"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-primary/30">
                <AvatarImage
                  src={previewAvatar || getUserAvatar(user.userId)}
                />
                <AvatarFallback className="text-3xl bg-primary/20">
                  {user.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer"
                >
                  <Camera className="w-8 h-8 text-white" />
                </motion.button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            {isEditing && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground"
              >
                Click to change photo
              </motion.p>
            )}
            {user.hasActiveSubscription && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                <Crown className="w-3 h-3 mr-1" />
                Premium Member
              </Badge>
            )}
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground/80">
                Username
              </Label>
              {isEditing ? (
                <Input
                  id="username"
                  value={editedProfile.username}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="bg-white/5 border-white/10 focus:border-primary"
                />
              ) : (
                <p className="text-foreground font-medium py-2">
                  {editedProfile.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80">
                Email Address
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="bg-white/5 border-white/10 focus:border-primary"
                />
              ) : (
                <p className="text-foreground font-medium py-2">
                  {editedProfile.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Subscription
          </h2>
          {editedProfile.hasActiveSubscription && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              Active
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subscriptionPlans.map((plan) => (
            <motion.div
              key={plan.type}
              whileHover={{ scale: 1.02 }}
              className={cn(
                "relative p-6 rounded-2xl border transition-all cursor-pointer",
                plan.current
                  ? "bg-primary/20 border-primary"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              )}
              onClick={() => {
                if (plan.type === "free") {
                  handleSubscriptionToggle(false);
                } else if (plan.type === "premium") {
                  handleSubscriptionToggle(true);
                }
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}
              {plan.current && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {plan.name}
              </h3>
              <p className="text-2xl font-bold text-foreground mb-4">
                {plan.price}
              </p>
              <ul className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6 border-red-500/20">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Danger Zone
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Delete Account</p>
            <p className="text-xs text-muted-foreground">
              Permanently delete your account and all data
            </p>
          </div>
          <Button
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Account"
            )}
          </Button>
        </div>
      </GlassCard>
    </div>
  )
};