// ─── Spotify API Types ─────────────────────────────────────────────

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  genres: string[];
  popularity: number;
  followers: { total: number };
  external_urls: { spotify: string };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
  total_tracks: number;
  artists: { id: string; name: string }[];
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: SpotifyAlbum;
  duration_ms: number;
  preview_url: string | null;
  popularity: number;
  explicit: boolean;
  external_urls: { spotify: string };
}

export interface SpotifyTopItems<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
}

export interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images: SpotifyImage[];
  followers: { total: number };
  country: string;
  product: string;
  external_urls: { spotify: string };
}

// ─── Streaming History Types ───────────────────────────────────────

export interface SpotifyStreamEntry {
  ts: string; // ISO timestamp
  platform: string;
  ms_played: number;
  conn_country: string;
  ip_addr: string;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  spotify_track_uri: string | null;
  episode_name: string | null;
  episode_show_name: string | null;
  spotify_episode_uri: string | null;
  audiobook_title: string | null;
  audiobook_uri: string | null;
  audiobook_chapter_uri: string | null;
  audiobook_chapter_title: string | null;
  reason_start: string;
  reason_end: string;
  shuffle: boolean;
  skipped: boolean;
  offline: boolean;
  offline_timestamp: number;
  incognito_mode: boolean;
}

// ─── Stats Types ───────────────────────────────────────────────────

export type TimeRange = "short_term" | "medium_term" | "long_term" | "all_time";

export interface StatItem {
  id: string;
  name: string;
  image?: string;
  playCount: number;
  totalMs: number;
  totalMinutes: number;
  totalHours: number;
  rank: number;
  percentage: number; // % of total plays
  spotifyUrl?: string;
  // Additional metadata
  subtitle?: string;
  genres?: string[];
  releaseDate?: string;
  duration?: number;
}

export interface StatsOverview {
  totalPlays: number;
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  uniqueArtists: number;
  uniqueTracks: number;
  uniqueAlbums: number;
  avgPlaysPerDay: number;
  avgMinutesPerDay: number;
  topGenre: string;
  firstPlayed: string;
  lastPlayed: string;
  daysTracked: number;
  skipRate: number;
  shuffleRate: number;
  mostActiveHour: number;
  mostActiveDay: string;
}

export interface HourlyStats {
  hour: number;
  plays: number;
  minutes: number;
}

export interface DailyStats {
  day: string;
  plays: number;
  minutes: number;
}

export interface MonthlyStats {
  month: string;
  plays: number;
  minutes: number;
}

export interface GenreStat {
  genre: string;
  plays: number;
  minutes: number;
  percentage: number;
}

export interface ListeningClockData {
  hour: number;
  day: string;
  plays: number;
  minutes: number;
}

export interface HeatMapDay {
  date: string;
  plays: number;
  minutes: number;
  level: 0 | 1 | 2 | 3 | 4; // GitHub-style contribution levels
}

// ─── API Response Types ────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Component Props ───────────────────────────────────────────────

export interface TopListProps {
  title: string;
  items: StatItem[];
  type: "artists" | "tracks" | "albums" | "genres";
  timeRange: TimeRange;
  maxItems?: number;
  showImages?: boolean;
}

export interface ProfileProps {
  username: string;
  name: string;
  image?: string;
  bio?: string;
  stats: StatsOverview;
  isOwnProfile?: boolean;
}
