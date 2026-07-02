"use client";

import React from "react";
import { formatNumber } from "@/lib/utils";
import type { StatsOverview as StatsOverviewType } from "@/types";

interface StatsOverviewProps {
  stats: StatsOverviewType;
}

const metrics = (stats: StatsOverviewType) => [
  { label: "Total plays", value: stats.totalPlays, decimals: 0 },
  { label: "Hours listened", value: Math.round(stats.totalHours), decimals: 0 },
  { label: "Unique artists", value: stats.uniqueArtists, decimals: 0 },
  { label: "Plays / day", value: stats.avgPlaysPerDay, decimals: 1 },
];

export function StatsOverview({ stats }: StatsOverviewProps) {
  const items = metrics(stats);

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-6 sm:gap-x-10">
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {/* Divider — visible only on sm+ */}
          {i > 0 && (
            <div
              className="hidden sm:block w-px h-8 bg-border"
              aria-hidden="true"
            />
          )}
          <div className="min-w-0">
            <p className="text-3xl font-bold text-foreground tabular-nums tracking-tight leading-none">
              {item.decimals > 0
                ? item.value.toFixed(item.decimals)
                : formatNumber(item.value)}
            </p>
            <p className="text-label text-muted-foreground mt-1.5">
              {item.label}
            </p>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
