"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { HeatMapDay } from "@/types";

interface HeatMapProps {
  data: HeatMapDay[];
}

const LEVEL_CLASSES: Record<number, string> = {
  0: "bg-muted",
  1: "bg-primary/15",
  2: "bg-primary/30",
  3: "bg-primary/50",
  4: "bg-primary",
};

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

export function HeatMap({ data }: HeatMapProps) {
  const { weeks, monthLabels, totalPlays, totalMinutes } = useMemo(() => {
    if (data.length === 0) {
      return { weeks: [], monthLabels: [], totalPlays: 0, totalMinutes: 0 };
    }

    // Sort by date
    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Group by week
    const weekMap = new Map<number, HeatMapDay[]>();
    const monthMap = new Map<number, string>();

    for (const day of sorted) {
      const date = new Date(day.date);
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const dayOfYear = Math.floor(
        (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24),
      );
      const weekIndex = Math.floor(dayOfYear / 7);

      if (!weekMap.has(weekIndex)) {
        weekMap.set(weekIndex, []);
      }
      weekMap.get(weekIndex)!.push(day);

      // Track first month seen in each week
      if (!monthMap.has(weekIndex)) {
        monthMap.set(
          weekIndex,
          date.toLocaleString("default", { month: "short" }),
        );
      }
    }

    const weeks = Array.from(weekMap.entries()).sort((a, b) => a[0] - b[0]);
    const monthLabels = Array.from(monthMap.entries()).sort(
      (a, b) => a[0] - b[0],
    );

    const totalPlays = data.reduce((sum, d) => sum + d.plays, 0);
    const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);

    return { weeks, monthLabels, totalPlays, totalMinutes };
  }, [data]);

  return (
    <div>
      <h3 className="text-h3 text-foreground mb-1">Activity</h3>
      <p className="text-[12px] text-muted-foreground mb-4">Last 90 days</p>

      <TooltipProvider delayDuration={0}>
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="inline-flex min-w-max">
            {/* Day labels — left */}
            <div className="flex flex-col mr-2">
              <div className="h-[10px] mb-[2px]" />{" "}
              {/* spacer for month labels */}
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="h-[12px] text-[10px] text-muted-foreground flex items-center"
                >
                  {label}
                </div>
              ))}
            </div>

            <div>
              {/* Month labels — top */}
              <div className="flex h-[10px] mb-[2px] relative">
                {monthLabels.map(([weekIndex, month], i) => {
                  // Only show label if enough space from the previous one
                  const prevWeek = i > 0 ? monthLabels[i - 1][0] : -999;
                  if (weekIndex - prevWeek < 3) return null;
                  return (
                    <div
                      key={weekIndex}
                      className="text-[10px] text-muted-foreground absolute"
                      style={{ left: `${weekIndex * 14}px` }}
                    >
                      {month}
                    </div>
                  );
                })}
              </div>

              {/* Grid */}
              <div className="flex gap-[2px]">
                {weeks.map(([weekIndex, week]) => (
                  <div key={weekIndex} className="flex flex-col gap-[2px]">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const day = week.find((d) => {
                        const date = new Date(d.date);
                        const dayOfWeek = date.getDay();
                        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                        return adjustedDay === dayIndex;
                      });

                      return (
                        <Tooltip key={`${weekIndex}-${dayIndex}`}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "h-[12px] w-[12px] rounded-[2px] transition-opacity ease-out hover:opacity-80 cursor-default",
                                day
                                  ? LEVEL_CLASSES[day.level]
                                  : LEVEL_CLASSES[0],
                              )}
                            />
                          </TooltipTrigger>
                          {day && (
                            <TooltipContent>
                              <p className="text-[11px]">
                                <span className="font-medium">{day.plays}</span>{" "}
                                plays
                                <br />
                                <span className="font-medium">
                                  {day.minutes}
                                </span>{" "}
                                min
                                <br />
                                {day.date}
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>

      {/* Summary + Legend */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          {formatNumber(totalPlays)} plays · {formatNumber(totalMinutes)} min
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground/70">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn("h-2 w-2 rounded-[1px]", LEVEL_CLASSES[level])}
            />
          ))}
          <span className="text-[10px] text-muted-foreground/70">More</span>
        </div>
      </div>
    </div>
  );
}
