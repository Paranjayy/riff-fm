"use client";

import React, { useEffect, useState } from "react";
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
import { StatsOverview as StatsOverviewComponent } from "@/components/dashboard/StatsOverview";
import { TopList } from "@/components/dashboard/TopList";
import { ListeningClock } from "@/components/dashboard/ListeningClock";
import { GenreChart } from "@/components/dashboard/GenreChart";
import { HeatMap } from "@/components/dashboard/HeatMap";
import { TimeMachine } from "@/components/dashboard/TimeMachine";
import { RecentPlays } from "@/components/dashboard/RecentPlays";

/* ─── Skeleton shapes ──────────────────────────────────────────── */

function StatsSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="space-y-2"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className="h-10 w-24 skeleton" />
          <div className="h-3 w-16 skeleton" />
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-0 divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 h-12"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className="w-5 h-3 skeleton" />
          <div className="w-8 h-8 skeleton rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="h-3 w-32 skeleton" />
            <div className="h-2 w-20 skeleton" />
          </div>
          <div className="hidden sm:block h-3 w-12 skeleton" />
          <div className="hidden sm:block h-3 w-10 skeleton" />
        </div>
      ))}
    </div>
  );
}

function ClockSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-5 w-32 skeleton" />
      <div className="space-y-[2px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-[2px]"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="w-10" />
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="h-4 flex-1 skeleton rounded-[2px]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function GenreSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-5 w-36 skeleton" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 h-8"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className="h-3 w-24 skeleton" />
          <div className="flex-1 h-2 skeleton rounded-full" />
          <div className="h-3 w-10 skeleton" />
        </div>
      ))}
    </div>
  );
}

function HeatMapSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-5 w-24 skeleton" />
      <div className="flex flex-wrap gap-[2px]">
        {Array.from({ length: 91 }).map((_, i) => (
          <div
            key={i}
            className="h-3 w-3 skeleton rounded-[2px]"
            style={{ animationDelay: `${(i % 7) * 20}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */

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

  /* Loading skeleton */
  if (status === "loading" || loading) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="h-3 w-20 skeleton" />
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="h-10 w-64 skeleton" />
            <div className="h-8 w-64 skeleton" />
          </div>
        </div>

        {/* Stats */}
        <div className="pt-8 border-t border-border">
          <StatsSkeleton />
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-8 pt-8 border-t border-border">
          <div className="space-y-8">
            <ListSkeleton />
            <ClockSkeleton />
          </div>
          <div className="space-y-8">
            <ListSkeleton />
            <GenreSkeleton />
          </div>
        </div>

        {/* Heatmap */}
        <div className="pt-8 border-t border-border">
          <HeatMapSkeleton />
        </div>

        {/* Recent plays */}
        <div className="pt-8 border-t border-border">
          <div className="h-5 w-28 skeleton mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 h-12"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="w-10 h-10 skeleton rounded-md shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="h-3 w-36 skeleton" />
                <div className="h-2.5 w-24 skeleton" />
              </div>
              <div className="h-3 w-10 skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* Empty state */
  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-h2 text-foreground mb-3">No data yet</h2>
        <p className="text-body text-muted-foreground max-w-md mb-8">
          Connect your Spotify account and import your listening history to see
          your stats here.
        </p>
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-[14px] font-medium hover:bg-primary/90 transition-colors ease-out"
        >
          Go to Settings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome header + time range */}
      <div>
        <p className="text-label text-muted-foreground mb-2">Overview</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-h1 text-foreground">
              Welcome back, {session?.user?.name?.split(" ")[0] || "there"}
            </h1>
          </div>
          <TimeMachine value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      {/* Stats metrics row */}
      <div className="border-t border-border pt-8">
        <StatsOverviewComponent stats={stats} />
      </div>

      {/* Two columns: 65/35 — left: artists + clock, right: songs + genres */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-8 border-t border-border pt-8">
        <div className="space-y-8">
          <TopList
            title="Top Artists"
            items={topArtists}
            type="artists"
            maxItems={5}
          />
          <ListeningClock data={clockData} />
        </div>
        <div className="space-y-8">
          <TopList
            title="Top Songs"
            items={topTracks}
            type="tracks"
            maxItems={5}
          />
          {genres.length > 0 && <GenreChart data={genres} />}
        </div>
      </div>

      {/* Heatmap — full width */}
      {heatMap.length > 0 && (
        <div className="border-t border-border pt-8">
          <HeatMap data={heatMap} />
        </div>
      )}

      {/* Recent plays — clean list */}
      {recentPlays.length > 0 && (
        <div className="border-t border-border pt-8">
          <RecentPlays plays={recentPlays} />
        </div>
      )}
    </div>
  );
}
