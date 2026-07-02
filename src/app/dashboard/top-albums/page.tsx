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

export default function TopAlbumsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [albums, setAlbums] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

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
          setAlbums(data.data.topAlbums || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [timeRange, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Top Albums</h1>
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
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No album data yet. Import your Spotify history to see your top
          albums.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albums.map((album, idx) => (
            <div
              key={album.id}
              className="group relative rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-square bg-secondary overflow-hidden">
                {album.image ? (
                  <img
                    src={album.image}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-muted-foreground">
                    💿
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums mt-0.5">
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{album.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {album.subtitle}
                    </p>
                  </div>
                </div>
                {album.releaseDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(album.releaseDate).getFullYear()}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{album.playCount.toLocaleString()} plays</span>
                  <span>{formatDuration(album.totalMs)}</span>
                </div>
              </div>
              {album.spotifyUrl && (
                <a
                  href={album.spotifyUrl}
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
