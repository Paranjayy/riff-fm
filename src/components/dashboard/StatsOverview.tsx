import React from "react";
import {
  Play,
  Clock,
  Mic2,
  Music2,
  TrendingUp,
  SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import type { StatsOverview as StatsOverviewType } from "@/types";

interface StatsOverviewProps {
  stats: StatsOverviewType;
}

const statCards = (stats: StatsOverviewType) => [
  {
    label: "Total Plays",
    value: formatNumber(stats.totalPlays),
    icon: Play,
    gradient: "from-[#1DB954]/20 to-emerald-500/10",
    iconColor: "text-[#1DB954]",
  },
  {
    label: "Hours Listened",
    value: formatNumber(stats.totalHours),
    icon: Clock,
    gradient: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-400",
  },
  {
    label: "Unique Artists",
    value: formatNumber(stats.uniqueArtists),
    icon: Mic2,
    gradient: "from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-400",
  },
  {
    label: "Unique Songs",
    value: formatNumber(stats.uniqueTracks),
    icon: Music2,
    gradient: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-400",
  },
  {
    label: "Avg Plays/Day",
    value: stats.avgPlaysPerDay.toFixed(1),
    icon: TrendingUp,
    gradient: "from-pink-500/20 to-pink-600/10",
    iconColor: "text-pink-400",
  },
  {
    label: "Skip Rate",
    value: `${(stats.skipRate * 100).toFixed(1)}%`,
    icon: SkipForward,
    gradient: "from-red-500/20 to-red-600/10",
    iconColor: "text-red-400",
  },
];

export function StatsOverview({ stats }: StatsOverviewProps) {
  const cards = statCards(stats);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map(({ label, value, icon: Icon, gradient, iconColor }) => (
        <div
          key={label}
          className={cn(
            "relative overflow-hidden rounded-xl border border-white/5 bg-gray-900/50 p-4 transition-colors hover:border-white/10"
          )}
        >
          {/* Subtle gradient background */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-60",
              gradient
            )}
          />

          <div className="relative">
            <Icon className={cn("mb-2 h-5 w-5", iconColor)} />
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-gray-400">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
