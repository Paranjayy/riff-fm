"use client";

import React from "react";
import type { GenreStat } from "@/types";

interface GenreChartProps {
  data: GenreStat[];
}

export function GenreChart({ data }: GenreChartProps) {
  const sorted = [...data].sort((a, b) => b.percentage - a.percentage);
  const maxPlays =
    sorted.length > 0 ? Math.max(...sorted.map((g) => g.plays)) : 1;

  return (
    <div>
      <div className="space-y-2.5">
        {sorted.map((genre) => {
          const barWidth = (genre.plays / maxPlays) * 100;
          return (
            <div key={genre.genre} className="flex items-center gap-3 h-7">
              {/* Genre name */}
              <span className="text-[12px] text-muted-foreground w-28 shrink-0 truncate">
                {genre.genre}
              </span>

              {/* Bar */}
              <div className="flex-1 h-1.5 bg-transparent rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* Percentage */}
              <span className="text-[11px] text-muted-foreground tabular-nums w-8 text-right shrink-0">
                {Math.round(genre.percentage)}%
              </span>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <p className="text-[13px] text-muted-foreground py-4">
            No genre data available.
          </p>
        )}
      </div>
    </div>
  );
}
