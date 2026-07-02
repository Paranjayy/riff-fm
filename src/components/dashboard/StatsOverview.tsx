"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Play,
  Clock,
  Mic2,
  Music2,
  TrendingUp,
  SkipForward,
  CalendarDays,
  Shuffle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import type { StatsOverview as StatsOverviewType } from "@/types";

interface StatsOverviewProps {
  stats: StatsOverviewType;
}

function useCountUp(end: number, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Number((from + (end - from) * eased).toFixed(decimals)));
      if (progress < 1) {
        ref.current = requestAnimationFrame(tick);
      }
    };

    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [end, duration, decimals]);

  return value;
}

function AnimatedStat({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  const count = useCountUp(value, 1400, decimals);
  return <>{count}</>;
}

function AnimatedPercent({ value }: { value: number }) {
  const count = useCountUp(value * 100, 1400, 1);
  return <>{count}%</>;
}

function AnimatedFixed({ value }: { value: number }) {
  const count = useCountUp(value, 1400, 1);
  return <>{count}</>;
}

function GlowIcon({
  icon: Icon,
  iconColor,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  className?: string;
}) {
  return (
    <div className="relative">
      <Icon className={cn("h-5 w-5 relative z-10", iconColor, className)} />
      <div
        className={cn(
          "absolute inset-0 blur-md opacity-50",
          iconColor.replace("text-", "bg-"),
        )}
      />
    </div>
  );
}

const statCards = (stats: StatsOverviewType) => [
  {
    label: "Total Plays",
    value: stats.totalPlays,
    rawValue: formatNumber(stats.totalPlays),
    icon: Play,
    gradient: "from-[#1DB954]/25 to-emerald-500/5",
    borderGradient:
      "bg-gradient-to-r from-[#1DB954]/30 via-emerald-400/10 to-transparent",
    iconColor: "text-[#1DB954]",
    render: (v: number) => formatNumber(v),
    type: "number" as const,
  },
  {
    label: "Hours Listened",
    value: stats.totalHours,
    rawValue: formatNumber(stats.totalHours),
    icon: Clock,
    gradient: "from-blue-500/20 to-blue-600/5",
    borderGradient:
      "bg-gradient-to-r from-blue-400/30 via-blue-300/10 to-transparent",
    iconColor: "text-blue-400",
    render: (v: number) => formatNumber(v),
    type: "number" as const,
  },
  {
    label: "Unique Artists",
    value: stats.uniqueArtists,
    rawValue: formatNumber(stats.uniqueArtists),
    icon: Mic2,
    gradient: "from-purple-500/20 to-purple-600/5",
    borderGradient:
      "bg-gradient-to-r from-purple-400/30 via-purple-300/10 to-transparent",
    iconColor: "text-purple-400",
    render: (v: number) => formatNumber(v),
    type: "number" as const,
  },
  {
    label: "Unique Songs",
    value: stats.uniqueTracks,
    rawValue: formatNumber(stats.uniqueTracks),
    icon: Music2,
    gradient: "from-amber-500/20 to-amber-600/5",
    borderGradient:
      "bg-gradient-to-r from-amber-400/30 via-amber-300/10 to-transparent",
    iconColor: "text-amber-400",
    render: (v: number) => formatNumber(v),
    type: "number" as const,
  },
  {
    label: "Avg Plays/Day",
    value: stats.avgPlaysPerDay,
    rawValue: stats.avgPlaysPerDay.toFixed(1),
    icon: TrendingUp,
    gradient: "from-pink-500/20 to-pink-600/5",
    borderGradient:
      "bg-gradient-to-r from-pink-400/30 via-pink-300/10 to-transparent",
    iconColor: "text-pink-400",
    render: (v: number) => v.toFixed(1),
    type: "fixed" as const,
  },
  {
    label: "Skip Rate",
    value: stats.skipRate * 100,
    rawValue: `${(stats.skipRate * 100).toFixed(1)}%`,
    icon: SkipForward,
    gradient: "from-red-500/20 to-red-600/5",
    borderGradient:
      "bg-gradient-to-r from-red-400/30 via-red-300/10 to-transparent",
    iconColor: "text-red-400",
    render: (v: number) => `${v.toFixed(1)}%`,
    type: "percent" as const,
  },
  {
    label: "Days Tracked",
    value: stats.daysTracked,
    rawValue: formatNumber(stats.daysTracked),
    icon: CalendarDays,
    gradient: "from-cyan-500/20 to-cyan-600/5",
    borderGradient:
      "bg-gradient-to-r from-cyan-400/30 via-cyan-300/10 to-transparent",
    iconColor: "text-cyan-400",
    render: (v: number) => formatNumber(v),
    type: "number" as const,
  },
  {
    label: "Shuffle Rate",
    value: stats.shuffleRate * 100,
    rawValue: `${(stats.shuffleRate * 100).toFixed(1)}%`,
    icon: Shuffle,
    gradient: "from-orange-500/20 to-orange-600/5",
    borderGradient:
      "bg-gradient-to-r from-orange-400/30 via-orange-300/10 to-transparent",
    iconColor: "text-orange-400",
    render: (v: number) => `${v.toFixed(1)}%`,
    type: "percent" as const,
  },
];

export function StatsOverview({ stats }: StatsOverviewProps) {
  const cards = statCards(stats);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map(
        ({
          label,
          value,
          icon: Icon,
          gradient,
          borderGradient,
          iconColor,
          type,
        }) => (
          <div
            key={label}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-white/5 bg-gray-900/50 p-5",
              "transition-all duration-300 hover:border-white/10 hover:bg-gray-900/70",
              "hover:shadow-lg hover:shadow-black/20",
            )}
          >
            {/* Gradient background */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-60",
                gradient,
              )}
            />

            {/* Top edge glow */}
            <div
              className={cn(
                "absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                borderGradient,
              )}
            />

            <div className="relative z-10">
              {/* Icon with glow */}
              <div className="mb-3">
                <GlowIcon icon={Icon} iconColor={iconColor} />
              </div>

              {/* Animated value */}
              <p className="text-2xl font-bold tracking-tight text-white">
                {type === "percent" ? (
                  <AnimatedPercent value={value / 100} />
                ) : type === "fixed" ? (
                  <AnimatedFixed value={value} />
                ) : (
                  <AnimatedStat value={value} />
                )}
              </p>

              <p className="mt-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
                {label}
              </p>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
