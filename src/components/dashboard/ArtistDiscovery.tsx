"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

interface HistoryEntry {
  artistId: string;
  artistName: string;
  playedAt: string;
}

interface ArtistDiscoveryProps {
  history: HistoryEntry[];
}

// ─── Helpers ────────────────────────────────────────────────────

function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

function formatMonth(monthKey: string): string {
  const d = new Date(monthKey + "-01");
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

// ─── Custom Tooltip ─────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload || !label) return null;

  const count = payload[0]?.value ?? 0;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">
        {count} new artist{count !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────

export function ArtistDiscovery({ history }: ArtistDiscoveryProps) {
  const { chartData, totalNew, currentMonthNew, currentMonthLabel } =
    useMemo(() => {
      if (history.length === 0) {
        return {
          chartData: [],
          totalNew: 0,
          currentMonthNew: 0,
          currentMonthLabel: "",
        };
      }

      // Track first time each artist was listened to
      const firstListen = new Map<string, string>(); // artistId -> earliest date
      for (const entry of history) {
        const existing = firstListen.get(entry.artistId);
        if (!existing || entry.playedAt < existing) {
          firstListen.set(entry.artistId, entry.playedAt);
        }
      }

      // Group first-time listens by month
      const monthCounts = new Map<string, number>();
      for (const playedAt of firstListen.values()) {
        const monthKey = getMonthKey(playedAt);
        monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
      }

      const sortedMonths = Array.from(monthCounts.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({
          month: formatMonth(month),
          newArtists: count,
        }));

      const now = new Date();
      const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const currentMonth = sortedMonths.find(
        (d) =>
          d.month ===
          formatMonth(currentKey),
      );

      return {
        chartData: sortedMonths,
        totalNew: firstListen.size,
        currentMonthNew: currentMonth?.newArtists ?? 0,
        currentMonthLabel: currentMonth?.month ?? formatMonth(currentKey),
      };
    }, [history]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Artist Discovery</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              New artists discovered each month
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
            <Compass className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {totalNew}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Compass className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Not enough listening history to show discovery trends.
            </p>
          </div>
        ) : (
          <>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
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
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Bar
                    dataKey="newArtists"
                    fill="#1DB954"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              You discovered{" "}
              <span className="font-semibold text-primary">
                {currentMonthNew}
              </span>{" "}
              new artist{currentMonthNew !== 1 ? "s" : ""} this month
              {currentMonthNew === 0 && " — keep exploring!"}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
