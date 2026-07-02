import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toLocaleString();
}

export function formatPlayCount(count: number): string {
  return count.toLocaleString();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getSpotifyTrackId(uri: string): string | null {
  const match = uri.match(/spotify:track:([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

export function getImageUrl(images: { url: string; height: number | null }[]): string | undefined {
  if (!images || images.length === 0) return undefined;
  // Prefer medium size (around 300px)
  const sorted = [...images].sort((a, b) => (a.height || 0) - (b.height || 0));
  return sorted[Math.min(1, sorted.length - 1)]?.url;
}

export function getLevel(plays: number, maxPlays: number): 0 | 1 | 2 | 3 | 4 {
  if (plays === 0) return 0;
  const ratio = plays / maxPlays;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}
