import { getLevel } from "./utils";
import { DAY_NAMES, MONTH_NAMES } from "./constants";
import type {
  TimeRange,
  StatItem,
  StatsOverview,
  HourlyStats,
  DailyStats,
  MonthlyStats,
  GenreStat,
  ListeningClockData,
  HeatMapDay,
} from "@/types";

// ─── Input Type ───────────────────────────────────────────────────

/**
 * Minimal shape the stats engine needs from each history row.
 * Enriched fields (names, images, genres, etc.) are optional –
 * populate them via Prisma `include` before passing data in.
 */
export interface ListeningEntry {
  playedAt: Date;
  msPlayed: number;
  skipped: boolean;
  shuffle: boolean;
  artistId: string;
  trackId: string;
  albumId: string;
  // Enriched metadata (optional, populated by the caller)
  artistName?: string;
  artistGenres?: string; // JSON string array, e.g. '["pop","rock"]'
  artistImage?: string;
  artistUrl?: string;
  trackName?: string;
  trackImage?: string;
  trackDurationMs?: number;
  albumName?: string;
  albumImage?: string;
  albumReleaseDate?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────

function parseGenres(json?: string): string[] {
  if (!json) return [];
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function toDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function sortByPlayCount(items: StatItem[]): StatItem[] {
  return items.sort((a, b) => b.playCount - a.playCount);
}

// ─── Time-range Filter ────────────────────────────────────────────

/** Return a new array containing only entries within the requested time range. */
export function filterByTimeRange(
  history: ListeningEntry[],
  timeRange: TimeRange,
): ListeningEntry[] {
  if (timeRange === "all_time") return history;

  const now = new Date();
  let cutoff: Date;

  switch (timeRange) {
    case "short_term":
      cutoff = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000);
      break;
    case "medium_term":
      cutoff = new Date(now.getTime() - 26 * 7 * 24 * 60 * 60 * 1000);
      break;
    case "long_term":
      cutoff = new Date(now.getTime() - 52 * 7 * 24 * 60 * 60 * 1000);
      break;
    default:
      return history;
  }

  return history.filter((e) => new Date(e.playedAt) >= cutoff);
}

// ─── Overview ─────────────────────────────────────────────────────

export function computeOverview(history: ListeningEntry[]): StatsOverview {
  if (history.length === 0) {
    return {
      totalPlays: 0,
      totalMinutes: 0,
      totalHours: 0,
      totalDays: 0,
      uniqueArtists: 0,
      uniqueTracks: 0,
      uniqueAlbums: 0,
      avgPlaysPerDay: 0,
      avgMinutesPerDay: 0,
      topGenre: "",
      firstPlayed: "",
      lastPlayed: "",
      daysTracked: 0,
      skipRate: 0,
      shuffleRate: 0,
      mostActiveHour: 0,
      mostActiveDay: "Sun",
    };
  }

  const totalMs = history.reduce((sum, e) => sum + e.msPlayed, 0);
  const totalMinutes = Math.round(totalMs / 60_000);
  const totalHours = Math.round((totalMs / 3_600_000) * 10) / 10;
  const totalDays = Math.round((totalMs / 86_400_000) * 10) / 10;

  const uniqueArtists = new Set(history.map((e) => e.artistId)).size;
  const uniqueTracks = new Set(history.map((e) => e.trackId)).size;
  const uniqueAlbums = new Set(history.map((e) => e.albumId)).size;

  // Days tracked = unique calendar dates with at least one play
  const daySet = new Set<string>();
  for (const e of history) daySet.add(toDateKey(new Date(e.playedAt)));
  const daysTracked = daySet.size;

  const avgPlaysPerDay =
    daysTracked > 0 ? Math.round((history.length / daysTracked) * 10) / 10 : 0;
  const avgMinutesPerDay =
    daysTracked > 0 ? Math.round((totalMinutes / daysTracked) * 10) / 10 : 0;

  // Top genre
  const genreStats = computeTopGenres(history);
  const topGenre = genreStats.length > 0 ? genreStats[0].genre : "";

  // Date range
  const sorted = [...history].sort(
    (a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime(),
  );
  const firstPlayed = new Date(sorted[0].playedAt).toISOString();
  const lastPlayed = new Date(sorted[sorted.length - 1].playedAt).toISOString();

  // Skip & shuffle rates
  const skippedCount = history.filter((e) => e.skipped).length;
  const shuffleCount = history.filter((e) => e.shuffle).length;
  const skipRate =
    history.length > 0 ? Math.round((skippedCount / history.length) * 10000) / 100 : 0;
  const shuffleRate =
    history.length > 0 ? Math.round((shuffleCount / history.length) * 10000) / 100 : 0;

  // Most active hour
  const hourly = computeHourlyStats(history);
  const mostActiveHour = hourly.reduce(
    (best, h) => (h.plays > best.plays ? h : best),
    hourly[0],
  ).hour;

  // Most active day
  const daily = computeDailyStats(history);
  const mostActiveDay = daily.reduce(
    (best, d) => (d.plays > best.plays ? d : best),
    daily[0],
  ).day;

  return {
    totalPlays: history.length,
    totalMinutes,
    totalHours,
    totalDays,
    uniqueArtists,
    uniqueTracks,
    uniqueAlbums,
    avgPlaysPerDay,
    avgMinutesPerDay,
    topGenre,
    firstPlayed,
    lastPlayed,
    daysTracked,
    skipRate,
    shuffleRate,
    mostActiveHour,
    mostActiveDay,
  };
}

// ─── Top Artists ──────────────────────────────────────────────────

export function computeTopArtists(history: ListeningEntry[]): StatItem[] {
  const map = new Map<
    string,
    { name: string; image?: string; url?: string; plays: number; ms: number; genres: string[] }
  >();

  for (const entry of history) {
    const existing = map.get(entry.artistId) ?? {
      name: entry.artistName ?? entry.artistId,
      image: entry.artistImage,
      url: entry.artistUrl,
      plays: 0,
      ms: 0,
      genres: [],
    };
    existing.plays += 1;
    existing.ms += entry.msPlayed;
    if (entry.artistImage && !existing.image) existing.image = entry.artistImage;
    if (entry.artistName && existing.name === entry.artistId) existing.name = entry.artistName;
    if (entry.artistUrl && !existing.url) existing.url = entry.artistUrl;

    // Merge genres (avoid duplicates)
    if (entry.artistGenres) {
      const parsed = parseGenres(entry.artistGenres);
      for (const g of parsed) {
        if (!existing.genres.includes(g)) existing.genres.push(g);
      }
    }
    map.set(entry.artistId, existing);
  }

  const totalPlays = history.length;

  const items: StatItem[] = Array.from(map.entries()).map(([id, data]) => ({
    id,
    name: data.name,
    image: data.image,
    playCount: data.plays,
    totalMs: data.ms,
    totalMinutes: Math.round(data.ms / 60_000),
    totalHours: Math.round((data.ms / 3_600_000) * 10) / 10,
    rank: 0, // assigned after sort
    percentage: totalPlays > 0 ? Math.round((data.plays / totalPlays) * 10000) / 100 : 0,
    spotifyUrl: data.url,
    genres: data.genres,
  }));

  return sortByPlayCount(items).map((item, i) => ({ ...item, rank: i + 1 }));
}

// ─── Top Tracks ───────────────────────────────────────────────────

export function computeTopTracks(history: ListeningEntry[]): StatItem[] {
  const map = new Map<
    string,
    {
      name: string;
      image?: string;
      artistName?: string;
      url?: string;
      durationMs?: number;
      plays: number;
      ms: number;
    }
  >();

  for (const entry of history) {
    const existing = map.get(entry.trackId) ?? {
      name: entry.trackName ?? entry.trackId,
      image: entry.trackImage,
      artistName: entry.artistName,
      url: entry.artistUrl,
      durationMs: entry.trackDurationMs,
      plays: 0,
      ms: 0,
    };
    existing.plays += 1;
    existing.ms += entry.msPlayed;
    if (entry.trackImage && !existing.image) existing.image = entry.trackImage;
    if (entry.trackName && existing.name === entry.trackId) existing.name = entry.trackName;
    if (entry.artistName && !existing.artistName) existing.artistName = entry.artistName;
    if (entry.artistUrl && !existing.url) existing.url = entry.artistUrl;
    if (entry.trackDurationMs && !existing.durationMs) existing.durationMs = entry.trackDurationMs;
    map.set(entry.trackId, existing);
  }

  const totalPlays = history.length;

  const items: StatItem[] = Array.from(map.entries()).map(([id, data]) => ({
    id,
    name: data.name,
    image: data.image,
    playCount: data.plays,
    totalMs: data.ms,
    totalMinutes: Math.round(data.ms / 60_000),
    totalHours: Math.round((data.ms / 3_600_000) * 10) / 10,
    rank: 0,
    percentage: totalPlays > 0 ? Math.round((data.plays / totalPlays) * 10000) / 100 : 0,
    spotifyUrl: data.url,
    subtitle: data.artistName,
    duration: data.durationMs,
  }));

  return sortByPlayCount(items).map((item, i) => ({ ...item, rank: i + 1 }));
}

// ─── Top Albums ───────────────────────────────────────────────────

export function computeTopAlbums(history: ListeningEntry[]): StatItem[] {
  const map = new Map<
    string,
    {
      name: string;
      image?: string;
      artistName?: string;
      url?: string;
      releaseDate?: string;
      plays: number;
      ms: number;
    }
  >();

  for (const entry of history) {
    const existing = map.get(entry.albumId) ?? {
      name: entry.albumName ?? entry.albumId,
      image: entry.albumImage,
      artistName: entry.artistName,
      url: entry.artistUrl,
      releaseDate: entry.albumReleaseDate,
      plays: 0,
      ms: 0,
    };
    existing.plays += 1;
    existing.ms += entry.msPlayed;
    if (entry.albumImage && !existing.image) existing.image = entry.albumImage;
    if (entry.albumName && existing.name === entry.albumId) existing.name = entry.albumName;
    if (entry.artistName && !existing.artistName) existing.artistName = entry.artistName;
    if (entry.artistUrl && !existing.url) existing.url = entry.artistUrl;
    if (entry.albumReleaseDate && !existing.releaseDate) existing.releaseDate = entry.albumReleaseDate;
    map.set(entry.albumId, existing);
  }

  const totalPlays = history.length;

  const items: StatItem[] = Array.from(map.entries()).map(([id, data]) => ({
    id,
    name: data.name,
    image: data.image,
    playCount: data.plays,
    totalMs: data.ms,
    totalMinutes: Math.round(data.ms / 60_000),
    totalHours: Math.round((data.ms / 3_600_000) * 10) / 10,
    rank: 0,
    percentage: totalPlays > 0 ? Math.round((data.plays / totalPlays) * 10000) / 100 : 0,
    spotifyUrl: data.url,
    subtitle: data.artistName,
    releaseDate: data.releaseDate,
  }));

  return sortByPlayCount(items).map((item, i) => ({ ...item, rank: i + 1 }));
}

// ─── Top Genres ───────────────────────────────────────────────────

export function computeTopGenres(history: ListeningEntry[]): GenreStat[] {
  const genreCounts = new Map<string, { plays: number; minutes: number }>();
  const totalPlays = history.length;

  for (const entry of history) {
    const genres = parseGenres(entry.artistGenres);
    const minutes = entry.msPlayed / 60_000;

    for (const genre of genres) {
      const existing = genreCounts.get(genre) ?? { plays: 0, minutes: 0 };
      existing.plays += 1;
      existing.minutes += minutes;
      genreCounts.set(genre, existing);
    }
  }

  return Array.from(genreCounts.entries())
    .map(([genre, data]) => ({
      genre,
      plays: data.plays,
      minutes: Math.round(data.minutes),
      percentage: totalPlays > 0 ? Math.round((data.plays / totalPlays) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.plays - a.plays);
}

// ─── Hourly Stats ─────────────────────────────────────────────────

export function computeHourlyStats(history: ListeningEntry[]): HourlyStats[] {
  const buckets: HourlyStats[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    plays: 0,
    minutes: 0,
  }));

  for (const entry of history) {
    const hour = new Date(entry.playedAt).getHours();
    buckets[hour].plays += 1;
    buckets[hour].minutes += entry.msPlayed / 60_000;
  }

  return buckets.map((b) => ({ ...b, minutes: Math.round(b.minutes) }));
}

// ─── Daily Stats ──────────────────────────────────────────────────

export function computeDailyStats(history: ListeningEntry[]): DailyStats[] {
  const buckets: DailyStats[] = DAY_NAMES.map((day) => ({
    day,
    plays: 0,
    minutes: 0,
  }));

  for (const entry of history) {
    const dayIndex = new Date(entry.playedAt).getDay(); // 0=Sun
    buckets[dayIndex].plays += 1;
    buckets[dayIndex].minutes += entry.msPlayed / 60_000;
  }

  return buckets.map((b) => ({ ...b, minutes: Math.round(b.minutes) }));
}

// ─── Monthly Stats ────────────────────────────────────────────────

export function computeMonthlyStats(history: ListeningEntry[]): MonthlyStats[] {
  const buckets: MonthlyStats[] = MONTH_NAMES.map((month) => ({
    month,
    plays: 0,
    minutes: 0,
  }));

  for (const entry of history) {
    const monthIndex = new Date(entry.playedAt).getMonth(); // 0=Jan
    buckets[monthIndex].plays += 1;
    buckets[monthIndex].minutes += entry.msPlayed / 60_000;
  }

  return buckets.map((b) => ({ ...b, minutes: Math.round(b.minutes) }));
}

// ─── Listening Clock (hour × day matrix) ──────────────────────────

export function computeListeningClock(history: ListeningEntry[]): ListeningClockData[] {
  const map = new Map<string, { plays: number; minutes: number }>();

  for (const entry of history) {
    const d = new Date(entry.playedAt);
    const hour = d.getHours();
    const day = DAY_NAMES[d.getDay()];
    const key = `${hour}-${day}`;

    const existing = map.get(key) ?? { plays: 0, minutes: 0 };
    existing.plays += 1;
    existing.minutes += entry.msPlayed / 60_000;
    map.set(key, existing);
  }

  const result: ListeningClockData[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (const day of DAY_NAMES) {
      const key = `${hour}-${day}`;
      const data = map.get(key) ?? { plays: 0, minutes: 0 };
      result.push({ hour, day, plays: data.plays, minutes: Math.round(data.minutes) });
    }
  }

  return result;
}

// ─── Heat Map (GitHub-style contribution graph) ──────────────────

export function computeHeatMap(
  history: ListeningEntry[],
  days: number = 90,
): HeatMapDay[] {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  // Aggregate plays/minutes by calendar date
  const dateMap = new Map<string, { plays: number; minutes: number }>();

  for (const entry of history) {
    const playedAt = new Date(entry.playedAt);
    if (playedAt < start || playedAt > now) continue;

    const key = toDateKey(playedAt);
    const existing = dateMap.get(key) ?? { plays: 0, minutes: 0 };
    existing.plays += 1;
    existing.minutes += entry.msPlayed / 60_000;
    dateMap.set(key, existing);
  }

  // Find the max plays across all days (for level normalisation)
  let maxPlays = 0;
  for (const data of dateMap.values()) {
    if (data.plays > maxPlays) maxPlays = data.plays;
  }

  // Build the full day-by-day array
  const result: HeatMapDay[] = [];
  const cursor = new Date(start);

  while (cursor <= now) {
    const key = toDateKey(cursor);
    const data = dateMap.get(key) ?? { plays: 0, minutes: 0 };

    result.push({
      date: key,
      plays: data.plays,
      minutes: Math.round(data.minutes),
      level: getLevel(data.plays, maxPlays),
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}
