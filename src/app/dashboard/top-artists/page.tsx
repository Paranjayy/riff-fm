"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { StatItem, TimeRange } from "@/types";
import { formatDuration } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ExternalLink } from "lucide-react";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "short_term", label: "4 Weeks" },
  { value: "medium_term", label: "6 Months" },
  { value: "long_term", label: "1 Year" },
  { value: "all_time", label: "All Time" },
];

type SortKey = "plays" | "hours";

export default function TopArtistsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [artists, setArtists] = useState<StatItem[]>([]);
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
          setArtists(data.data.topArtists || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [timeRange, status]);

  const sorted = [...artists].sort((a, b) =>
    sortBy === "plays"
      ? b.playCount - a.playCount
      : b.totalHours - a.totalHours
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Top Artists</h1>
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
          No artist data yet. Import your Spotify history to see your top
          artists.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sorted.map((artist, idx) => (
            <div
              key={artist.id}
              className="group relative rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-square bg-secondary overflow-hidden">
                {artist.image ? (
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-muted-foreground">
                    🎤
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums mt-0.5">
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {artist.name}
                    </p>
                  </div>
                </div>
                {artist.genres && artist.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {artist.genres.slice(0, 2).map((g) => (
                      <span
                        key={g}
                        className="px-1.5 py-0.5 bg-secondary rounded text-[10px] text-muted-foreground"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{artist.playCount.toLocaleString()} plays</span>
                  <span>{formatDuration(artist.totalMs)}</span>
                </div>
              </div>
              {artist.spotifyUrl && (
                <a
                  href={artist.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
