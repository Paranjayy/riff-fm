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
            className="text-[13px] text-primary hover:text-primary/80 transition-colors ease-out"
          >
            See all
          </Link>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-border">
        {displayItems.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "group flex items-center gap-3 sm:gap-4 h-12 px-2 -mx-2 rounded-lg hover:bg-secondary transition-colors ease-out",
            )}
          >
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
              <span className="text-[13px] font-medium text-foreground/60 tabular-nums w-16 text-right">
                {formatNumber(item.playCount)}
              </span>
              <span className="text-[12px] text-muted-foreground tabular-nums w-12 text-right">
                {formatDuration(item.totalMs)}
              </span>
            </div>

            {/* Spotify link — appears on hover */}
            {item.spotifyUrl && (
              <a
                href={item.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity ease-out hover:text-primary"
                title="Listen on Spotify"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </a>
            )}
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
