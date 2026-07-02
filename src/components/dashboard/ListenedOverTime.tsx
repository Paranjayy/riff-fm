"use client";

import React, { useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────

interface ListeningDataPoint {
  date: string;
  plays: number;
  minutes: number;
}

interface ListenedOverTimeProps {
  data: ListeningDataPoint[];
}

type ViewMode = "daily" | "weekly" | "monthly";

// ─── Helpers ────────────────────────────────────────────────────

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function groupByWeek(data: ListeningDataPoint[]): ListeningDataPoint[] {
  const map = new Map<string, { plays: number; minutes: number }>();
  for (const point of data) {
    const d = new Date(point.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split("T")[0];
    const existing = map.get(key) || { plays: 0, minutes: 0 };
    map.set(key, {
      plays: existing.plays + point.plays,
      minutes: existing.minutes + point.minutes,
    });
  }
  return Array.from(map.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function groupByMonth(data: ListeningDataPoint[]): ListeningDataPoint[] {
  const map = new Map<string, { plays: number; minutes: number }>();
  for (const point of data) {
    const key = point.date.slice(0, 7); // YYYY-MM
    const existing = map.get(key) || { plays: 0, minutes: 0 };
    map.set(key, {
      plays: existing.plays + point.plays,
      minutes: existing.minutes + point.minutes,
    });
  }
  return Array.from(map.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─── Custom Tooltip ─────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
  viewMode,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
  viewMode: ViewMode;
}) {
  if (!active || !payload || !label) return null;

  const plays = payload.find((p) => p.name === "plays")?.value ?? 0;
  const minutes = payload.find((p) => p.name === "minutes")?.value ?? 0;
  const dateLabel =
    viewMode === "monthly"
      ? new Date(label + "-01").toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : formatDateFull(label);

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{dateLabel}</p>
      <p className="text-sm font-semibold text-foreground">
        {plays.toLocaleString()} plays
      </p>
      <p className="text-xs text-muted-foreground">
        {minutes >= 60
          ? `${(minutes / 60).toFixed(1)}h`
          : `${minutes}m`}{" "}
        listened
      </p>
    </div>
  );
}

// ─── View mode tabs ─────────────────────────────────────────────

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

// ─── Component ──────────────────────────────────────────────────

export function ListenedOverTime({ data }: ListenedOverTimeProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("daily");

  const chartData = useMemo(() => {
    switch (viewMode) {
      case "weekly":
        return groupByWeek(data);
      case "monthly":
        return groupByMonth(data);
      default:
        return data;
    }
  }, [data, viewMode]);

  const xTickFormatter = (value: string) => {
    if (viewMode === "monthly") {
      const d = new Date(value + "-01");
      return d.toLocaleDateString("en-US", { month: "short" });
    }
    return formatDateShort(value);
  };

  const totalPlays = chartData.reduce((sum, d) => sum + d.plays, 0);
  const totalMinutes = chartData.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Listening Over Time</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {totalPlays.toLocaleString()} plays ·{" "}
              {totalMinutes >= 60
                ? `${(totalMinutes / 60).toFixed(1)}h`
                : `${totalMinutes}m`}{" "}
              total
            </p>
          </div>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
            {VIEW_MODES.map((vm) => (
              <button
                key={vm.value}
                onClick={() => setViewMode(vm.value)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                  viewMode === vm.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {vm.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1DB954" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#1DB954" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(0 0% 15%)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={xTickFormatter}
                stroke="hsl(0 0% 63%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="hsl(0 0% 63%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={<CustomTooltip viewMode={viewMode} />}
                cursor={{
                  stroke: "hsl(0 0% 20%)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                type="monotone"
                dataKey="plays"
                stroke="#1DB954"
                strokeWidth={2}
                fill="url(#greenGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#1DB954",
                  stroke: "#030303",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
