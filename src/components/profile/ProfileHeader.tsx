import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

interface ProfileHeaderProps {
  user: {
    name: string;
    username: string;
    image?: string;
    bio?: string;
  };
  isOwnProfile?: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <Avatar className="h-24 w-24 shrink-0 ring-4 ring-[#1DB954]/20 sm:h-32 sm:w-32">
        <AvatarImage src={user.image} alt={user.name} />
        <AvatarFallback className="bg-gradient-to-br from-[#1DB954] to-emerald-600 text-2xl font-bold text-black sm:text-3xl">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <h1 className="text-2xl font-bold sm:text-3xl">{user.name}</h1>
        <p className="text-gray-400">@{user.username}</p>

        {user.bio && (
          <p className="mt-2 max-w-md text-sm text-gray-300">{user.bio}</p>
        )}

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
          <div>
            <span className="font-semibold text-white">--</span> followers
          </div>
          <div>
            <span className="font-semibold text-white">--</span> following
          </div>
        </div>

        {isOwnProfile && (
          <Button variant="outline" size="sm" className="mt-4">
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
}
