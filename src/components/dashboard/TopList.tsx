import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatNumber, formatDuration } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { StatItem } from "@/types";

interface TopListProps {
  title: string;
  items: StatItem[];
  type: "artists" | "tracks" | "albums" | "genres";
  maxItems?: number;
}

export function TopList({ title, items, type, maxItems = 5 }: TopListProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h3 text-foreground">{title}</h3>
        {items.length > maxItems && (
          <Link
            href={`/dashboard/${type === "artists" ? "top-artists" : type === "tracks" ? "top-songs" : type === "albums" ? "top-albums" : "genres"}`}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors ease-out"
          >
            See all
          </Link>
        )}
      </div>

      {/* Table */}
      <div>
        {displayItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3 sm:gap-4 h-10">
            {/* Rank */}
            <span
              className={cn(
                "w-5 text-right text-[13px] tabular-nums shrink-0",
                item.rank <= 3
                  ? "font-semibold text-foreground/70"
                  : "text-muted-foreground",
              )}
            >
              {item.rank}
            </span>

            {/* Image */}
            <Avatar
              className={cn(
                "w-8 h-8 shrink-0",
                type === "artists" ? "rounded-full" : "rounded-md",
              )}
            >
              <AvatarImage src={item.image} alt={item.name} />
              <AvatarFallback className="bg-muted text-[10px] text-muted-foreground">
                {item.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Name + subtitle */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">
                {item.name}
              </p>
              {item.subtitle && (
                <p className="text-[12px] text-muted-foreground truncate">
                  {item.subtitle}
                </p>
              )}
            </div>

            {/* Stats — hidden on mobile */}
            <div className="hidden sm:flex items-center gap-5 shrink-0">
              <span className="text-[13px] text-foreground/60 tabular-nums w-16 text-right">
                {formatNumber(item.playCount)}
              </span>
              <span className="text-[12px] text-muted-foreground tabular-nums w-12 text-right">
                {formatDuration(item.totalMs)}
              </span>
            </div>
          </div>
        ))}

        {displayItems.length === 0 && (
          <p className="text-[13px] text-muted-foreground py-8">
            No data yet. Import your Spotify history to see your top {type}.
          </p>
        )}
      </div>
    </div>
  );
}
