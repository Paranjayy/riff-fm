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
    <div className="flex flex-wrap items-baseline gap-x-10 gap-y-6">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <p className="stat-value text-foreground">
            {item.decimals > 0
              ? item.value.toFixed(item.decimals)
              : formatNumber(item.value)}
          </p>
          <p className="stat-label text-muted-foreground mt-2">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
