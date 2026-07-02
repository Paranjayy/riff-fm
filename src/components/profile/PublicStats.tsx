import React from "react";
import { Play, Clock, Mic2, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import type { StatsOverview } from "@/types";

interface PublicStatsProps {
  stats: StatsOverview;
}

const items = (stats: StatsOverview) => [
  {
    label: "Total Plays",
    value: formatNumber(stats.totalPlays),
    icon: Play,
    color: "text-[#1DB954]",
  },
  {
    label: "Hours",
    value: formatNumber(stats.totalHours),
    icon: Clock,
    color: "text-blue-400",
  },
  {
    label: "Artists",
    value: formatNumber(stats.uniqueArtists),
    icon: Mic2,
    color: "text-purple-400",
  },
  {
    label: "Songs",
    value: formatNumber(stats.uniqueTracks),
    icon: Music2,
    color: "text-amber-400",
  },
];

export function PublicStats({ stats }: PublicStatsProps) {
  const statItems = items(stats);

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl border border-white/5 bg-gray-900/50 px-6 py-4 sm:justify-start">
      {statItems.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", color)} />
          <span className="text-lg font-bold">{value}</span>
          <span className="text-sm text-gray-400">{label}</span>
        </div>
      ))}
    </div>
  );
}
