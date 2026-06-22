"use client";

import { useState } from "react";
import { X, Search, UserPlus, UserMinus, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { cn } from "../lib/utils";

interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  isFollowing?: boolean;
  isVerified?: boolean;
}

interface FollowersPopupProps {
  followers: User[];
  following: User[];
  followerCount: number;
  followingCount: number;
  onFollowToggle?: (userId: string, isFollowing: boolean) => void;
  onUserClick?: (userId: string) => void;
  trigger?: React.ReactNode;
  defaultTab?: "followers" | "following";
}

export function FollowersPopup({
  followers,
  following,
  followerCount,
  followingCount,
  onFollowToggle,
  onUserClick,
  trigger,
  defaultTab = "followers",
}: FollowersPopupProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"followers" | "following">(defaultTab);

  const filteredFollowers = followers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFollowing = following.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">
            {followerCount.toLocaleString()} followers
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-card border-border">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-semibold text-center">
            Connections
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "followers" | "following")}
          className="w-full flex flex-col"
        >
          <TabsList className="w-full rounded-none border-b border-border bg-transparent h-12">
            <TabsTrigger
              value="followers"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Followers
              <span className="ml-2 text-xs text-muted-foreground">
                {followerCount.toLocaleString()}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Following
              <span className="ml-2 text-xs text-muted-foreground">
                {followingCount.toLocaleString()}
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="p-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>

          <TabsContent value="followers" className="m-0">
            <ScrollArea className="h-[400px]">
              <div className="p-2">
                {filteredFollowers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <p className="text-sm">No followers found</p>
                  </div>
                ) : (
                  filteredFollowers.map((user) => (
                    <UserListItem
                      key={user.id}
                      user={user}
                      onFollowToggle={onFollowToggle}
                      onUserClick={onUserClick}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="following" className="m-0">
            <ScrollArea className="h-[400px]">
              <div className="p-2">
                {filteredFollowing.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <p className="text-sm">Not following anyone</p>
                  </div>
                ) : (
                  filteredFollowing.map((user) => (
                    <UserListItem
                      key={user.id}
                      user={user}
                      onFollowToggle={onFollowToggle}
                      onUserClick={onUserClick}
                      showFollowing
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface UserListItemProps {
  user: User;
  onFollowToggle?: (userId: string, isFollowing: boolean) => void;
  onUserClick?: (userId: string) => void;
  showFollowing?: boolean;
}

function UserListItem({
  user,
  onFollowToggle,
  onUserClick,
  showFollowing = false,
}: UserListItemProps) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing ?? false);
  const [isHovering, setIsHovering] = useState(false);

  const handleFollowClick = () => {
    const newState = !isFollowing;
    setIsFollowing(newState);
    onFollowToggle?.(user.id, newState);
  };

  return (
    <div
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
      onClick={() => onUserClick?.(user.id)}
    >
      <Avatar className="h-11 w-11 flex-shrink-0">
        <AvatarImage src={user.avatarUrl} alt={user.name} />
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          {user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground truncate">
            {user.name}
          </span>
          {user.isVerified && (
            <span className="flex-shrink-0 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-primary-foreground" />
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground truncate block">
          @{user.username}
        </span>
      </div>

      <Button
        variant={isFollowing ? "secondary" : "default"}
        size="sm"
        className={cn(
          "min-w-[90px] transition-all",
          isFollowing && isHovering && "bg-destructive/10 text-destructive hover:bg-destructive/20"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={(e) => {
          e.stopPropagation();
          handleFollowClick();
        }}
      >
        {isFollowing ? (
          isHovering ? (
            <>
              <UserMinus className="h-3.5 w-3.5 mr-1.5" />
              Unfollow
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Following
            </>
          )
        ) : (
          <>
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Follow
          </>
        )}
      </Button>
    </div>
  );
}

export function UserCard({
  user,
  onFollowToggle,
  onUserClick,
}: {
  user: User;
  onFollowToggle?: (userId: string, isFollowing: boolean) => void;
  onUserClick?: (userId: string) => void;
}) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing ?? false);

  const handleFollowClick = () => {
    const newState = !isFollowing;
    setIsFollowing(newState);
    onFollowToggle?.(user.id, newState);
  };

  return (
    <div
      className="flex flex-col items-center gap-3 p-4 rounded-lg bg-card/50 hover:bg-card transition-all cursor-pointer"
      onClick={() => onUserClick?.(user.id)}
    >
      <Avatar className="h-24 w-24">
        <AvatarImage src={user.avatarUrl} alt={user.name} />
        <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
          {user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center gap-0.5 min-w-0 w-full">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground truncate">
            {user.name}
          </span>
          {user.isVerified && (
            <span className="flex-shrink-0 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-primary-foreground" />
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground truncate">
          @{user.username}
        </span>
      </div>

      <Button
        variant={isFollowing ? "secondary" : "default"}
        size="sm"
        className="w-full"
        onClick={(e) => {
          e.stopPropagation();
          handleFollowClick();
        }}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </div>
  );
}
