"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { StatItem, TimeRange } from "@/types";
import { formatDuration } from "@/lib/utils";
import { Loader2, ExternalLink } from "lucide-react";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "short_term", label: "4 Weeks" },
  { value: "medium_term", label: "6 Months" },
  { value: "long_term", label: "1 Year" },
  { value: "all_time", label: "All Time" },
];

type SortKey = "plays" | "hours";

export default function TopSongsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [songs, setSongs] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("plays");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch(`/api/spotify/stats?timeRange=${timeRange}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setSongs(data.data.topTracks || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [timeRange, status]);

  const sorted = [...songs].sort((a, b) =>
    sortBy === "plays"
      ? b.playCount - a.playCount
      : b.totalHours - a.totalHours
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Top Songs</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-card border border-border rounded-lg p-1 gap-1">
            {TIME_RANGES.map((tr) => (
              <button
                key={tr.value}
                onClick={() => setTimeRange(tr.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeRange === tr.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tr.label}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground"
          >
            <option value="plays">Sort by Plays</option>
            <option value="hours">Sort by Hours</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No song data yet. Import your Spotify history to see your top
          songs.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[40px_50px_1fr_1fr_100px_80px] gap-3 px-4 py-3 bg-card/50 text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
            <span>#</span>
            <span />
            <span>Title</span>
            <span className="hidden md:block">Album</span>
            <span className="text-right">Plays</span>
            <span className="text-right">Duration</span>
          </div>
          {/* Rows */}
          {sorted.map((song, idx) => (
            <div
              key={song.id}
              className="grid grid-cols-[40px_50px_1fr_1fr_100px_80px] gap-3 px-4 py-3 items-center hover:bg-card/50 transition-colors border-b border-border/50 last:border-b-0 group"
            >
              <span className="text-sm text-muted-foreground tabular-nums text-center">
                {idx + 1}
              </span>
              {song.image ? (
                <img
                  src={song.image}
                  alt=""
                  className="w-10 h-10 rounded object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center text-muted-foreground text-xs">
                  🎵
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{song.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {song.subtitle}
                </p>
              </div>
              <p className="text-sm text-muted-foreground truncate hidden md:block">
                {song.subtitle?.split(" - ")[1] || "—"}
              </p>
              <span className="text-sm text-right tabular-nums">
                {song.playCount.toLocaleString()}
              </span>
              <span className="text-sm text-right text-muted-foreground tabular-nums">
                {formatDuration(song.totalMs)}
              </span>
              {song.spotifyUrl && (
                <a
                  href={song.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
