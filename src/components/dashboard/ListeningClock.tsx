"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ListeningClockData } from "@/types";

interface ListeningClockProps {
  data: ListeningClockData[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getIntensityClass(plays: number, maxPlays: number): string {
  if (plays === 0) return "bg-gray-800/50";
  const ratio = plays / maxPlays;
  if (ratio <= 0.2) return "bg-purple-900/60";
  if (ratio <= 0.4) return "bg-purple-700/60";
  if (ratio <= 0.6) return "bg-emerald-800/60";
  if (ratio <= 0.8) return "bg-emerald-600/70";
  return "bg-[#1DB954]/80";
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
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
    <div className="rounded-xl border border-white/5 bg-gray-900/50 p-4 sm:p-6">
      <h3 className="mb-4 text-lg font-semibold">Listening Clock</h3>

      <TooltipProvider delayDuration={0}>
        <div className="overflow-x-auto">
          <div className="inline-flex min-w-[600px] flex-col gap-0.5">
            {/* Day labels header */}
            <div className="mb-1 flex items-center">
              <div className="w-12" /> {/* spacer for hour labels */}
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="flex-1 text-center text-xs font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Hour rows */}
            {HOURS.map((hour) => (
              <div key={hour} className="flex items-center gap-0.5">
                {/* Hour label */}
                <div className="w-12 text-right pr-2 text-xs text-gray-500">
                  {hour % 3 === 0 ? formatHour(hour) : ""}
                </div>

                {/* Day cells */}
                {DAYS.map((day) => {
                  const plays = grid.get(`${hour}-${day}`) || 0;
                  return (
                    <Tooltip key={`${hour}-${day}`}>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            "h-5 flex-1 rounded-sm transition-transform hover:scale-150 hover:z-10",
                            getIntensityClass(plays, maxPlays)
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          <span className="font-medium">{plays}</span> plays
                          <br />
                          {day} at {formatHour(hour)}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </TooltipProvider>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <span className="text-xs text-gray-500">Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              "h-3 w-3 rounded-sm",
              level === 0 && "bg-gray-800/50",
              level === 1 && "bg-purple-900/60",
              level === 2 && "bg-purple-700/60",
              level === 3 && "bg-emerald-600/70",
              level === 4 && "bg-[#1DB954]/80"
            )}
          />
        ))}
        <span className="text-xs text-gray-500">More</span>
      </div>
    </div>
  );
}
