"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ListeningClockData } from "@/types";

interface ListeningClockProps {
  data: ListeningClockData[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getIntensityClass(plays: number, maxPlays: number): string {
  if (plays === 0) return "bg-muted";
  const ratio = plays / maxPlays;
  if (ratio <= 0.15) return "bg-primary/15";
  if (ratio <= 0.35) return "bg-primary/30";
  if (ratio <= 0.55) return "bg-primary/50";
  if (ratio <= 0.75) return "bg-primary/70";
  return "bg-primary";
}

function formatHour(hour: number): string {
  if (hour === 0) return "12a";
  if (hour === 12) return "12p";
  return hour < 12 ? `${hour}a` : `${hour - 12}p`;
}

export function ListeningClock({ data }: ListeningClockProps) {
  const { grid, maxPlays } = useMemo(() => {
    const map = new Map<string, number>();
    let max = 0;
    for (const entry of data) {
      const key = `${entry.hour}-${entry.day}`;
      map.set(key, entry.plays);
      if (entry.plays > max) max = entry.plays;
    }
    return { grid: map, maxPlays: max };
  }, [data]);

  return (
    <div>
      <h3 className="text-h3 text-foreground mb-4">Listening clock</h3>

      <div className="overflow-x-auto -mx-1 px-1">
        <div className="inline-flex min-w-[420px] flex-col gap-[1px]">
          {/* Day labels — top */}
          <div className="flex items-center mb-1">
            <div className="w-10 shrink-0" />
            {DAYS.map((day) => (
              <div
                key={day}
                className="flex-1 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Hour rows */}
          {HOURS.map((hour) => (
            <div key={hour} className="flex items-center gap-[1px]">
              <div className="w-10 shrink-0 text-right pr-2 text-[10px] text-muted-foreground tabular-nums">
                {hour % 4 === 0 ? formatHour(hour) : ""}
              </div>
              {DAYS.map((day) => {
                const plays = grid.get(`${hour}-${day}`) || 0;
                return (
                  <div
                    key={`${hour}-${day}`}
                    className={cn(
                      "h-[3px] flex-1 rounded-[1px] cursor-default",
                      getIntensityClass(plays, maxPlays),
                    )}
                    title={`${plays} plays — ${day} at ${formatHour(hour)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
