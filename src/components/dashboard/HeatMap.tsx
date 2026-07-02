"use client";

import React from "react";
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
  0: "bg-gray-800/50",
  1: "bg-[#1DB954]/20",
  2: "bg-[#1DB954]/40",
  3: "bg-[#1DB954]/65",
  4: "bg-[#1DB954]",
};

export function HeatMap({ data }: HeatMapProps) {
  const totalPlays = data.reduce((sum, d) => sum + d.plays, 0);
  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <div className="rounded-xl border border-white/5 bg-gray-900/50 p-4 sm:p-6">
      <h3 className="mb-1 text-lg font-semibold">Activity</h3>

      <TooltipProvider delayDuration={0}>
        <div className="flex flex-wrap gap-[3px]">
          {data.map((day) => (
            <Tooltip key={day.date}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "h-3 w-3 rounded-sm transition-transform hover:scale-150",
                    LEVEL_CLASSES[day.level]
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  <span className="font-medium">{day.plays}</span> plays
                  <br />
                  <span className="font-medium">{day.minutes}</span> minutes
                  <br />
                  {day.date}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Summary + Legend */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {formatNumber(totalPlays)} total plays · {formatNumber(totalMinutes)}{" "}
          minutes in the last 90 days
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn("h-2.5 w-2.5 rounded-sm", LEVEL_CLASSES[level])}
            />
          ))}
          <span className="text-xs text-gray-500">More</span>
        </div>
      </div>
    </div>
  );
}
