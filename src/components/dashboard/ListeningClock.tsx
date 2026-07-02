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

      <TooltipProvider delayDuration={0}>
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="inline-flex min-w-[480px] flex-col gap-[2px]">
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
              <div key={hour} className="flex items-center gap-[2px]">
                <div className="w-10 shrink-0 text-right pr-2 text-[10px] text-muted-foreground tabular-nums">
                  {hour % 4 === 0 ? formatHour(hour) : ""}
                </div>
                {DAYS.map((day) => {
                  const plays = grid.get(`${hour}-${day}`) || 0;
                  return (
                    <Tooltip key={`${hour}-${day}`}>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            "h-4 flex-1 rounded-[2px] transition-opacity ease-out hover:opacity-80 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                            getIntensityClass(plays, maxPlays),
                          )}
                          aria-label={`${plays} plays on ${day} at ${formatHour(hour)}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-[11px]">
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

      {/* Legend + caption */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground/70">
          When you listen to music by hour and day
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground/70">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "h-2 w-2 rounded-[1px]",
                level === 0 && "bg-muted",
                level === 1 && "bg-primary/15",
                level === 2 && "bg-primary/30",
                level === 3 && "bg-primary/50",
                level === 4 && "bg-primary/80",
              )}
            />
          ))}
          <span className="text-[10px] text-muted-foreground/70">More</span>
        </div>
      </div>
    </div>
  );
}
