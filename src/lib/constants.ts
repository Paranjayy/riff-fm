export const APP_NAME = "riff.fm";
export const APP_DESCRIPTION = "All-in-one media stats. Track music, movies, anime, books, games, and more.";
export const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-top-read",
  "user-read-recently-played",
  "user-read-playback-position",
  "user-library-read",
  "playlist-modify-public",
  "playlist-modify-private",
].join(" ");

export const TIME_RANGES = {
  short_term: { label: "Last 4 Weeks", weeks: 4 },
  medium_term: { label: "Last 6 Months", weeks: 26 },
  long_term: { label: "Last Year", weeks: 52 },
  all_time: { label: "All Time", weeks: Infinity },
} as const;

export const TOP_LIST_LIMITS = {
  short: 10,
  medium: 20,
  long: 50,
  all: 100,
} as const;

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export const GENRE_COLORS: Record<string, string> = {
  "Hindi Pop": "#FF6B6B",
  "Bollywood": "#FF8E53",
  "Desi": "#FFC93C",
  "Hindi Indie": "#6BCB77",
  "Indian Indie": "#4D96FF",
  "Sufi": "#9B59B6",
  "Pop": "#E74C3C",
  "Rock": "#3498DB",
  "Hip-Hop": "#F39C12",
  "R&B": "#1ABC9C",
  "Electronic": "#E91E63",
  "Jazz": "#795548",
  "Classical": "#607D8B",
  "Default": "#9CA3AF",
};

export const MEDIA_TYPES = [
  { id: "music", label: "Music", icon: "🎵", status: "live" as const },
  { id: "movies", label: "Movies & TV", icon: "🎬", status: "planned" as const },
  { id: "anime", label: "Anime", icon: "🎌", status: "planned" as const },
  { id: "books", label: "Books & Manga", icon: "📚", status: "planned" as const },
  { id: "games", label: "Games", icon: "🎮", status: "planned" as const },
  { id: "youtube", label: "YouTube & Podcasts", icon: "📺", status: "planned" as const },
  { id: "articles", label: "Articles & Essays", icon: "📝", status: "planned" as const },
] as const;
