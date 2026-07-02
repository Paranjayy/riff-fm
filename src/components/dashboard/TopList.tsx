import React from "react";
import Link from "next/link";
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
            className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/5"
          >
            {/* Rank */}
            <span className="w-6 shrink-0 text-center text-sm font-medium text-gray-500">
              {item.rank}
            </span>

            {/* Image */}
            {type === "genres" ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#1DB954]/30 to-emerald-600/30 text-xs font-bold text-[#1DB954]">
                {item.name.slice(0, 2).toUpperCase()}
              </div>
            ) : (
              <Avatar
                className={cn(
                  "h-10 w-10 shrink-0",
                  type === "artists" && "rounded-full",
                  (type === "tracks" || type === "albums") && "rounded-md"
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
              <p className="truncate text-sm font-medium">{item.name}</p>
              {item.subtitle && (
                <p className="truncate text-xs text-gray-400">
                  {item.subtitle}
                </p>
              )}
            </div>

            {/* Play count & duration */}
            <div className="hidden shrink-0 text-right sm:block">
              <p className="text-sm font-medium">
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
          </div>
        ))}
      </div>
    </div>
  );
}
