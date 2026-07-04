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

  /* Loading */
  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-[13px] text-muted-foreground">Loading...</p>
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
    <div className="space-y-10">
      {/* Welcome header + time range */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <h1 className="text-h1 text-foreground">
          Welcome back, {session?.user?.name?.split(" ")[0] || "there"}
        </h1>
        <TimeMachine value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Stats metrics row */}
      <StatsOverviewComponent stats={stats} />

      {/* Two columns: 65/35 — left: artists + clock, right: songs + genres */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-10">
        <div className="space-y-10">
          <TopList
            title="Top Artists"
            items={topArtists}
            type="artists"
            maxItems={5}
          />
          <ListeningClock data={clockData} />
        </div>
        <div className="space-y-10">
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
      {heatMap.length > 0 && <HeatMap data={heatMap} />}

      {/* Recent plays */}
      {recentPlays.length > 0 && <RecentPlays plays={recentPlays} />}
    </div>
  );
}
