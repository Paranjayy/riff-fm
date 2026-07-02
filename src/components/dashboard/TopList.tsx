import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatDuration } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import type { StatItem } from "@/types";

interface TopListProps {
  title: string;
  items: StatItem[];
  type: "artists" | "tracks" | "albums" | "genres";
  maxItems?: number;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-[10px] font-bold text-black shadow-md shadow-amber-500/30">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-[10px] font-bold text-gray-900 shadow-md shadow-gray-400/20">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-orange-700 text-[10px] font-bold text-orange-100 shadow-md shadow-orange-600/20">
        3
      </span>
    );
  }
  return (
    <span className="w-6 shrink-0 text-center text-sm font-medium text-gray-500">
      {rank}
    </span>
  );
}

export function TopList({ title, items, type, maxItems = 5 }: TopListProps) {
  const displayItems = items.slice(0, maxItems);
  const hasMore = items.length > maxItems;

  return (
    <div className="rounded-xl border border-white/5 bg-gray-900/50 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {hasMore && (
          <Link
            href={`/dashboard/${type}`}
            className="text-sm text-[#1DB954] hover:underline"
          >
            See All
          </Link>
        )}
      </div>

      <div className="space-y-1">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="group/item flex items-center gap-3 rounded-lg px-2 py-2.5 transition-all duration-200 hover:bg-white/[0.04]"
          >
            {/* Rank */}
            <RankBadge rank={item.rank} />

            {/* Image */}
            {type === "genres" ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#1DB954]/30 to-emerald-600/30 text-xs font-bold text-[#1DB954]">
                {item.name.slice(0, 2).toUpperCase()}
              </div>
            ) : (
              <Avatar
                className={cn(
                  "h-10 w-10 shrink-0 ring-2 ring-transparent group-hover/item:ring-white/10 transition-all duration-200",
                  type === "artists" && "rounded-full",
                  (type === "tracks" || type === "albums") && "rounded-md",
                )}
              >
                <AvatarImage src={item.image} alt={item.name} />
                <AvatarFallback className="bg-gray-800 text-xs">
                  {item.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium group-hover/item:text-white transition-colors">
                {item.name}
              </p>
              {item.subtitle && (
                <p className="truncate text-xs text-gray-400">
                  {item.subtitle}
                </p>
              )}
            </div>

            {/* Play count & duration */}
            <div className="hidden shrink-0 text-right sm:block">
              <p className="text-sm font-medium tabular-nums">
                {formatNumber(item.playCount)}
              </p>
              <p className="text-xs text-gray-400">
                {formatDuration(item.totalMs)}
              </p>
            </div>

            {/* Progress bar */}
            <div className="hidden w-24 shrink-0 lg:block">
              <Progress value={item.percentage} className="h-1.5" />
            </div>

            {/* Spotify link */}
            {item.spotifyUrl && (
              <a
                href={item.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-gray-600 opacity-0 group-hover/item:opacity-100 transition-all duration-200 hover:text-[#1DB954]"
                title="Listen on Spotify"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
