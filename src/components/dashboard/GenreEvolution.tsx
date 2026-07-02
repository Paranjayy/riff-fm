"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─── Types ──────────────────────────────────────────────────────

interface GenreMonthData {
  month: string;
  genres: Record<string, number>;
}

interface GenreEvolutionProps {
  monthlyGenres: GenreMonthData[];
}

// ─── Color palette ──────────────────────────────────────────────

const GENRE_COLORS = [
  { stroke: "#1DB954", fill: "url(#genreGreen)" },
  { stroke: "#8B5CF6", fill: "url(#genrePurple)" },
  { stroke: "#F59E0B", fill: "url(#genreAmber)" },
  { stroke: "#EF4444", fill: "url(#genreRed)" },
  { stroke: "#06B6D4", fill: "url(#genreCyan)" },
];

const GRADIENT_DEFS: Array<{
  id: string;
  color: string;
}> = [
  { id: "genreGreen", color: "#1DB954" },
  { id: "genrePurple", color: "#8B5CF6" },
  { id: "genreAmber", color: "#F59E0B" },
  { id: "genreRed", color: "#EF4444" },
  { id: "genreCyan", color: "#06B6D4" },
];

// ─── Helpers ────────────────────────────────────────────────────

function formatMonth(monthKey: string): string {
  const d = new Date(monthKey + "-01");
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function getTopGenres(
  data: GenreMonthData[],
  count: number,
): string[] {
  const totals = new Map<string, number>();
  for (const entry of data) {
    for (const [genre, plays] of Object.entries(entry.genres)) {
      totals.set(genre, (totals.get(genre) || 0) + plays);
    }
  }
  return Array.from(totals.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([genre]) => genre);
}

// ─── Custom Tooltip ─────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
  topGenres,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
  topGenres: string[];
}) {
  if (!active || !payload || !label) return null;

  const sorted = payload
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl min-w-[160px]">
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      {sorted.map((entry, i) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: GENRE_COLORS[i]?.stroke ?? "#888" }}
            />
            <span className="text-xs text-foreground">{entry.name}</span>
          </div>
          <span className="text-xs font-medium tabular-nums">
            {entry.value.toLocaleString()} plays
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────

export function GenreEvolution({ monthlyGenres }: GenreEvolutionProps) {
  const topGenres = useMemo(
    () => getTopGenres(monthlyGenres, 5),
    [monthlyGenres],
  );

  const chartData = useMemo(
    () =>
      monthlyGenres.map((entry) => ({
        month: formatMonth(entry.month),
        ...Object.fromEntries(
          topGenres.map((g) => [g, entry.genres[g] || 0]),
        ),
      })),
    [monthlyGenres, topGenres],
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Genre Evolution</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          How your taste changes over time
        </p>
      </CardHeader>
      <CardContent>
        {topGenres.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Not enough data to show genre trends yet.
            </p>
          </div>
        ) : (
          <>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4">
              {topGenres.map((genre, i) => (
                <div key={genre} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: GENRE_COLORS[i].stroke }}
                  />
                  <span className="text-xs text-muted-foreground">{genre}</span>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                  stackOffset="none"
                >
                  <defs>
                    {GRADIENT_DEFS.map((g) => (
                      <linearGradient
                        key={g.id}
                        id={g.id}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={g.color}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor={g.color}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(0 0% 15%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(0 0% 63%)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(0 0% 63%)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={
                      <CustomTooltip topGenres={topGenres} />
                    }
                    cursor={{
                      stroke: "hsl(0 0% 20%)",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                  />
                  {topGenres.map((genre, i) => (
                    <Area
                      key={genre}
                      type="monotone"
                      dataKey={genre}
                      stackId="1"
                      stroke={GENRE_COLORS[i].stroke}
                      strokeWidth={1.5}
                      fill={GENRE_COLORS[i].fill}
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: GENRE_COLORS[i].stroke,
                        stroke: "#030303",
                        strokeWidth: 2,
                      }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
