"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Zap, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────

interface HeatMapEntry {
  date: string;
  plays: number;
}

interface ListeningStreaksProps {
  heatMapData: HeatMapEntry[];
}

// ─── Helpers ────────────────────────────────────────────────────

function computeStreaks(data: HeatMapEntry[]): {
  current: number;
  longest: number;
  activeDays: number;
} {
  if (data.length === 0) return { current: 0, longest: 0, activeDays: 0 };

  // Build a set of active dates (plays > 0), sorted ascending
  const activeDates = new Set(
    data.filter((d) => d.plays > 0).map((d) => d.date),
  );

  const activeDays = activeDates.size;
  if (activeDays === 0) return { current: 0, longest: 0, activeDays: 0 };

  const sorted = Array.from(activeDates).sort();

  // Longest streak
  let longest = 1;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 1;
    }
  }

  // Current streak (counting backwards from today / last active day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let current = 0;
  const checkDate = new Date(today);
  // Allow "today" to be the last active day or yesterday
  // Walk backwards until we find a gap
  while (true) {
    const key = checkDate.toISOString().split("T")[0];
    if (activeDates.has(key)) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // If today isn't active, check if yesterday was — streak still alive
  if (current === 0) {
    checkDate.setDate(today.getDate() - 1);
    while (true) {
      const key = checkDate.toISOString().split("T")[0];
      if (activeDates.has(key)) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return { current, longest, activeDays };
}

const levelColors: Record<number, string> = {
  0: "bg-secondary",
  1: "bg-[#0e4429]",
  2: "bg-[#006d32]",
  3: "bg-[#26a641]",
  4: "bg-[#1DB954]",
};

// ─── Calendar grid (last 7 weeks) ──────────────────────────────

function CalendarHeatmap({ data }: { data: HeatMapEntry[] }) {
  const playMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of data) m.set(d.date, d.plays);
    return m;
  }, [data]);

  // Build the last 7 weeks (49 days) of cells
  const weeks: { date: string; plays: number; level: 0 | 1 | 2 | 3 | 4 }[][] =
    [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  // Align to end of week (Saturday)
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 48); // 7 weeks back

  const allCells: {
    date: string;
    plays: number;
    level: 0 | 1 | 2 | 3 | 4;
  }[] = [];
  const d = new Date(startDate);
  while (d <= endDate) {
    const key = d.toISOString().split("T")[0];
    const plays = playMap.get(key) || 0;
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (plays > 0) {
      if (plays <= 5) level = 1;
      else if (plays <= 15) level = 2;
      else if (plays <= 30) level = 3;
      else level = 4;
    }
    allCells.push({ date: key, plays, level });
    d.setDate(d.getDate() + 1);
  }

  // Split into weeks (columns of 7)
  for (let i = 0; i < allCells.length; i += 7) {
    weeks.push(allCells.slice(i, i + 7));
  }

  return (
    <div className="flex gap-[3px]">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((cell) => (
            <div
              key={cell.date}
              className={cn(
                "w-3 h-3 rounded-sm transition-colors",
                levelColors[cell.level],
              )}
              title={`${cell.date}: ${cell.plays} plays`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────

export function ListeningStreaks({ heatMapData }: ListeningStreaksProps) {
  const { current, longest, activeDays } = useMemo(
    () => computeStreaks(heatMapData),
    [heatMapData],
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Listening Streaks</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Your consistency over the last 7 weeks
        </p>
      </CardHeader>
      <CardContent>
        {/* Streak stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Flame
                className={cn(
                  "h-4 w-4",
                  current > 0 ? "text-orange-400" : "text-muted-foreground",
                )}
              />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Current
              </span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {current}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                day{current !== 1 ? "s" : ""}
              </span>
            </p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Best
              </span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {longest}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                day{longest !== 1 ? "s" : ""}
              </span>
            </p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active
              </span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {activeDays}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                day{activeDays !== 1 ? "s" : ""}
              </span>
            </p>
          </div>
        </div>

        {/* Calendar heatmap */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Less
          </p>
          <CalendarHeatmap data={heatMapData} />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            More
          </p>
        </div>
        <div className="flex items-center justify-end gap-1 mt-2">
          {[0, 1, 2, 3, 4].map((lvl) => (
            <div
              key={lvl}
              className={cn("w-3 h-3 rounded-sm", levelColors[lvl])}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
