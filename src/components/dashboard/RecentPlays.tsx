import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDuration } from "@/lib/utils";

interface RecentPlay {
  track: string;
  artist: string;
  album: string;
  image?: string;
  playedAt: string;
  duration: number;
}

interface RecentPlaysProps {
  plays: RecentPlay[];
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentPlays({ plays }: RecentPlaysProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-gray-900/50 p-4 sm:p-6">
      <h3 className="mb-4 text-lg font-semibold">Recent Plays</h3>

      <div className="space-y-1">
        {plays.map((play, i) => (
          <div
            key={`${play.track}-${play.playedAt}-${i}`}
            className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/5"
          >
            <Avatar className="h-10 w-10 shrink-0 rounded-md">
              <AvatarImage src={play.image} alt={play.album} />
              <AvatarFallback className="rounded-md bg-gray-800 text-xs">
                {play.album.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{play.track}</p>
              <p className="truncate text-xs text-gray-400">
                {play.artist} · {play.album}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-xs text-gray-500">
                {timeAgo(play.playedAt)}
              </p>
              <p className="text-xs text-gray-500">
                {formatDuration(play.duration)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
