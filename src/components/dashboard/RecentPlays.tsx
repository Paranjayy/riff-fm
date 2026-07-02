import React from "react";

interface RecentPlay {
  id?: string;
  track?: {
    name?: string;
    album?: {
      image?: string;
    };
    artist?: {
      name?: string;
    };
  };
  playedAt: string;
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
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export function RecentPlays({ plays }: RecentPlaysProps) {
  return (
    <div>
      <h3 className="text-h3 text-foreground mb-4">Recent plays</h3>

      <div className="divide-y divide-border">
        {plays.map((play, i) => (
          <div
            key={play.id || `${play.track?.name}-${play.playedAt}-${i}`}
            className="flex items-center gap-3 h-12 px-2 -mx-2 rounded-lg hover:bg-secondary transition-colors ease-out"
          >
            {/* Album art */}
            {play.track?.album?.image ? (
              <img
                src={play.track.album.image}
                alt=""
                className="w-10 h-10 rounded-md object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-muted shrink-0" />
            )}

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">
                {play.track?.name}
              </p>
              <p className="text-[12px] text-muted-foreground truncate">
                {play.track?.artist?.name}
              </p>
            </div>

            {/* Time ago */}
            <span className="text-[12px] text-muted-foreground whitespace-nowrap tabular-nums shrink-0">
              {timeAgo(play.playedAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
