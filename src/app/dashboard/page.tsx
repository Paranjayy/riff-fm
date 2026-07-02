"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type {
  StatsOverview,
  StatItem,
  TimeRange,
  HeatMapDay,
  ListeningClockData,
  GenreStat,
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// ─── Skeleton components ──────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-card border border-border animate-pulse">
      <div className="h-3 w-20 bg-muted rounded mb-2" />
      <div className="h-8 w-16 bg-muted rounded" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded bg-muted" />
          <div className="flex-1">
            <div className="h-3 w-32 bg-muted rounded mb-1" />
            <div className="h-2 w-20 bg-muted rounded" />
          </div>
          <div className="h-3 w-8 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── TimeMachine selector ─────────────────────────────────────────
const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "short_term", label: "4 Weeks" },
  { value: "medium_term", label: "6 Months" },
  { value: "long_term", label: "1 Year" },
  { value: "all_time", label: "All Time" },
];

function TimeMachine({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
      {TIME_RANGES.map((tr) => (
        <button
          key={tr.value}
          onClick={() => onChange(tr.value)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            value === tr.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          {tr.label}
        </button>
      ))}
    </div>
  );
}

// ─── Mini stat card ───────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── Top list mini component ──────────────────────────────────────
function TopListMini({
  title,
  items,
  type,
}: {
  title: string;
  items: StatItem[];
  type: "artists" | "tracks";
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No data yet. Import your Spotify history to see your top{" "}
            {type === "artists" ? "artists" : "songs"}.
          </p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 5).map((item, idx) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-5 text-right tabular-nums">
                  {idx + 1}
                </span>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.playCount.toLocaleString()} plays
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [topArtists, setTopArtists] = useState<StatItem[]>([]);
  const [topTracks, setTopTracks] = useState<StatItem[]>([]);
  const [genres, setGenres] = useState<GenreStat[]>([]);
  const [clockData, setClockData] = useState<ListeningClockData[]>([]);
  const [heatMap, setHeatMap] = useState<HeatMapDay[]>([]);
  const [recentPlays, setRecentPlays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchStats() {
      setLoading(true);
      try {
        const res = await fetch(`/api/spotify/stats?timeRange=${timeRange}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setStats(data.data.overview);
            setTopArtists(data.data.topArtists || []);
            setTopTracks(data.data.topTracks || []);
            setGenres(data.data.genres || []);
            setClockData(data.data.clockData || []);
            setHeatMap(data.data.heatMap || []);
            setRecentPlays(data.data.recentPlays || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [timeRange, status]);

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <ListSkeleton />
          </Card>
          <Card className="p-6">
            <ListSkeleton />
          </Card>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-5xl mb-4">🎵</div>
        <h2 className="text-xl font-bold mb-2">No data yet</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Connect your Spotify account and import your listening history to
          see your stats here.
        </p>
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Go to Settings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {session?.user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Here&apos;s your listening overview
          </p>
        </div>
        <TimeMachine value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Stats overview grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Plays"
          value={stats.totalPlays.toLocaleString()}
        />
        <StatCard
          label="Hours Listened"
          value={Math.round(stats.totalHours).toLocaleString()}
          sub={`${Math.round(stats.totalDays)} days`}
        />
        <StatCard
          label="Unique Artists"
          value={stats.uniqueArtists.toLocaleString()}
        />
        <StatCard
          label="Unique Tracks"
          value={stats.uniqueTracks.toLocaleString()}
        />
        <StatCard
          label="Top Genre"
          value={stats.topGenre || "N/A"}
        />
        <StatCard
          label="Skip Rate"
          value={`${Math.round(stats.skipRate)}%`}
        />
        <StatCard
          label="Most Active Hour"
          value={`${stats.mostActiveHour}:00`}
        />
        <StatCard
          label="Avg Plays/Day"
          value={stats.avgPlaysPerDay.toFixed(1)}
        />
      </div>

      {/* Top Artists + Top Songs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopListMini title="Top Artists" items={topArtists} type="artists" />
        <TopListMini title="Top Songs" items={topTracks} type="tracks" />
      </div>

      {/* Genre chart */}
      {genres.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Genre Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {genres.slice(0, 8).map((g) => (
                <div key={g.genre}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{g.genre}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(g.percentage)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${g.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent plays */}
      {recentPlays.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Plays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPlays.slice(0, 10).map((play: any, idx: number) => (
                <div
                  key={play.id || idx}
                  className="flex items-center gap-3"
                >
                  {play.track?.album?.image && (
                    <img
                      src={play.track.album.image}
                      alt=""
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {play.track?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {play.track?.artist?.name}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(play.playedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
