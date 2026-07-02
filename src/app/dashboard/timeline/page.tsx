"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { TimeRange, HeatMapDay, ListeningClockData, GenreStat } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "short_term", label: "4 Weeks" },
  { value: "medium_term", label: "6 Months" },
  { value: "long_term", label: "1 Year" },
  { value: "all_time", label: "All Time" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function HeatMapCalendar({ data }: { data: HeatMapDay[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No listening history for this period.
      </p>
    );
  }

  const levelColors = [
    "bg-secondary",
    "bg-primary/20",
    "bg-primary/40",
    "bg-primary/60",
    "bg-primary",
  ];

  const dayMap = new Map<string, HeatMapDay>();
  data.forEach((d) => dayMap.set(d.date, d));

  // Group into weeks
  const weeks: HeatMapDay[][] = [];
  let currentWeek: HeatMapDay[] = [];

  data.forEach((day, idx) => {
    const date = new Date(day.date);
    const dayOfWeek = (date.getDay() + 6) % 7; // Monday=0
    currentWeek.push(day);
    if (dayOfWeek === 6 || idx === data.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="overflow-x-auto pb-2">
      <div className="inline-flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.plays} plays, ${day.minutes}m`}
                className={`w-3 h-3 rounded-sm ${levelColors[day.level]} cursor-default transition-colors hover:ring-1 hover:ring-primary/50`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-3">
        <span className="text-[10px] text-muted-foreground mr-1">Less</span>
        {levelColors.map((color, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
        ))}
        <span className="text-[10px] text-muted-foreground ml-1">More</span>
      </div>
    </div>
  );
}

function ListeningClockVisual({ data }: { data: ListeningClockData[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No clock data available.</p>
    );
  }

  const maxPlays = Math.max(...data.map((d) => d.plays), 1);

  return (
    <div className="grid grid-cols-12 gap-1">
      {Array.from({ length: 24 }).map((_, hour) => {
        const hourData = data.find((d) => d.hour === hour);
        const plays = hourData?.plays || 0;
        const intensity = plays / maxPlays;
        return (
          <div key={hour} className="flex flex-col items-center gap-1">
            <div
              className="w-full aspect-square rounded-md transition-all"
              style={{
                backgroundColor: `hsl(142, 71%, ${Math.max(10, intensity * 45)}%)`,
                opacity: Math.max(0.3, intensity),
              }}
              title={`${hour}:00 — ${plays} plays`}
            />
            <span className="text-[9px] text-muted-foreground">
              {hour % 3 === 0 ? `${hour}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function TimelinePage() {
  const { status } = useSession();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [heatMap, setHeatMap] = useState<HeatMapDay[]>([]);
  const [clockData, setClockData] = useState<ListeningClockData[]>([]);
  const [genres, setGenres] = useState<GenreStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch(`/api/spotify/stats?timeRange=${timeRange}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setHeatMap(data.data.heatMap || []);
          setClockData(data.data.clockData || []);
          setGenres(data.data.genres || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [timeRange, status]);

  // "On this day" stats
  const today = new Date().toISOString().slice(0, 10);
  const todayData = heatMap.find((d) => d.date === today);

  // Most active day
  const dayStats: Record<string, number> = {};
  clockData.forEach((d) => {
    dayStats[d.day] = (dayStats[d.day] || 0) + d.plays;
  });
  const mostActiveDay =
    Object.entries(dayStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Peak hour
  const hourStats: Record<number, number> = {};
  clockData.forEach((d) => {
    hourStats[d.hour] = (hourStats[d.hour] || 0) + d.plays;
  });
  const peakHour =
    Object.entries(hourStats)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Timeline</h1>
        <div className="flex bg-card border border-border rounded-lg p-1 gap-1">
          {TIME_RANGES.map((tr) => (
            <button
              key={tr.value}
              onClick={() => setTimeRange(tr.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                timeRange === tr.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {tr.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Most Active Day
              </p>
              <p className="text-lg font-bold">{mostActiveDay}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Peak Hour
              </p>
              <p className="text-lg font-bold">{peakHour !== "N/A" ? `${peakHour}:00` : "N/A"}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Days Tracked
              </p>
              <p className="text-lg font-bold">{heatMap.filter((d) => d.plays > 0).length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                On This Day
              </p>
              <p className="text-lg font-bold">
                {todayData ? `${todayData.plays} plays` : "No data"}
              </p>
            </Card>
          </div>

          {/* Heatmap */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Activity Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <HeatMapCalendar data={heatMap} />
            </CardContent>
          </Card>

          {/* Listening Clock */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Listening Clock</CardTitle>
              <p className="text-xs text-muted-foreground">
                When you listen to music, by hour
              </p>
            </CardHeader>
            <CardContent>
              <ListeningClockVisual data={clockData} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
