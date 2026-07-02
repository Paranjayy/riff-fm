"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { GenreStat, TimeRange } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "short_term", label: "4 Weeks" },
  { value: "medium_term", label: "6 Months" },
  { value: "long_term", label: "1 Year" },
  { value: "all_time", label: "All Time" },
];

const GENRE_COLORS = [
  "#1DB954",
  "#1ed760",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#3B82F6",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
  "#F97316",
];

export default function GenresPage() {
  const { status } = useSession();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [genres, setGenres] = useState<GenreStat[]>([]);
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
          setGenres(data.data.genres || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [timeRange, status]);

  const chartData = genres.slice(0, 15).map((g) => ({
    name: g.genre,
    plays: g.plays,
    minutes: g.minutes,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Genres</h1>
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
      ) : genres.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No genre data yet. Import your Spotify history to see genre
          breakdowns.
        </div>
      ) : (
        <>
          {/* Bar chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Genre Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#9CA3AF" }}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0 0% 6%)",
                        border: "1px solid hsl(0 0% 15%)",
                        borderRadius: "8px",
                        color: "hsl(0 0% 98%)",
                      }}
                    />
                    <Bar dataKey="plays" radius={[0, 4, 4, 0]}>
                      {chartData.map((_, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={GENRE_COLORS[idx % GENRE_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Genre breakdown list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {genres.map((genre, idx) => (
              <div
                key={genre.genre}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
              >
                <div
                  className="w-2 h-10 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      GENRE_COLORS[idx % GENRE_COLORS.length],
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{genre.genre}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(genre.percentage)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${genre.percentage}%`,
                        backgroundColor:
                          GENRE_COLORS[idx % GENRE_COLORS.length],
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {genre.plays.toLocaleString()} plays ·{" "}
                    {Math.round(genre.minutes / 60)}h listened
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
