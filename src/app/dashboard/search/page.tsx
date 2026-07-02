"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Search,
  Music,
  Mic2,
  Disc3,
  Clock,
  X,
  ArrowRight,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "artist" | "track" | "album";
  name: string;
  image?: string;
  artist?: string;
  album?: string;
  playCount: number;
  totalMs: number;
  totalMinutes: number;
  totalHours: number;
  durationMs?: number;
  spotifyUrl?: string;
  genres?: string[];
}

interface SearchResults {
  artists?: SearchResult[];
  tracks?: SearchResult[];
  albums?: SearchResult[];
}

const RECENT_SEARCHES_KEY = "riff-fm-recent-searches";
const MAX_RECENT = 10;

export default function SearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce search input
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, 300);
  }, []);

  // Execute search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      return;
    }

    let cancelled = false;

    async function search() {
      setLoading(true);
      try {
        const typeParam =
          activeTab === "all" ? "artists,tracks,albums" : activeTab;
        const res = await fetch(
          `/api/spotify/search?q=${encodeURIComponent(debouncedQuery)}&type=${typeParam}`,
        );
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.success) {
            setResults(data.data);
            saveRecentSearch(debouncedQuery);
          }
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    search();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, activeTab]);

  function saveRecentSearch(term: string) {
    setRecentSearches((prev) => {
      const updated = [term, ...prev.filter((s) => s !== term)].slice(
        0,
        MAX_RECENT,
      );
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }

  function handleRecentClick(term: string) {
    setQuery(term);
    setDebouncedQuery(term);
    inputRef.current?.focus();
  }

  function clearRecent() {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  }

  function removeRecent(term: string) {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }

  const allResults = [
    ...(results?.artists || []),
    ...(results?.tracks || []),
    ...(results?.albums || []),
  ].sort((a, b) => b.playCount - a.playCount);

  const totalCount = allResults.length;

  function getTypeIcon(type: string) {
    switch (type) {
      case "artist":
        return <Mic2 className="w-4 h-4" />;
      case "track":
        return <Music className="w-4 h-4" />;
      case "album":
        return <Disc3 className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case "artist":
        return "Artist";
      case "track":
        return "Track";
      case "album":
        return "Album";
      default:
        return type;
    }
  }

  function renderResultCard(result: SearchResult) {
    return (
      <div
        key={`${result.type}-${result.id}`}
        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
      >
        {/* Image / Icon */}
        {result.image ? (
          <img
            src={result.image}
            alt=""
            className={`w-12 h-12 object-cover shrink-0 ${
              result.type === "artist" ? "rounded-full" : "rounded-md"
            }`}
          />
        ) : (
          <div
            className={`w-12 h-12 bg-muted flex items-center justify-center shrink-0 ${
              result.type === "artist" ? "rounded-full" : "rounded-md"
            }`}
          >
            {getTypeIcon(result.type)}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              {result.name}
            </p>
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {getTypeLabel(result.type)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {result.type === "artist"
              ? result.genres?.slice(0, 3).join(", ") || "Artist"
              : result.type === "track"
                ? `${result.artist || "Unknown"}${result.album ? ` · ${result.album}` : ""}`
                : result.artist || "Album"}
          </p>
        </div>

        {/* Play Count */}
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-foreground">
            {formatNumber(result.playCount)}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {result.totalHours < 1
              ? `${Math.round(result.totalMinutes)}m`
              : `${result.totalHours.toFixed(1)}h`}
          </p>
        </div>

        {/* Spotify link */}
        {result.spotifyUrl && (
          <a
            href={result.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
          >
            <ArrowRight className="w-4 h-4" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search your listening history
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search artists, tracks, or albums..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setDebouncedQuery("");
              setResults(null);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* No Query — Show Recent Searches */}
      {!debouncedQuery.trim() && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Recent Searches
              </CardTitle>
              {recentSearches.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecent}
                  className="text-xs h-7"
                >
                  Clear all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recentSearches.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Start typing to search your listening history.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    className="flex items-center gap-1 bg-secondary rounded-full pl-3 pr-1 py-1"
                  >
                    <button
                      onClick={() => handleRecentClick(term)}
                      className="text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {term}
                    </button>
                    <button
                      onClick={() => removeRecent(term)}
                      className="p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && debouncedQuery.trim() && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">
            Searching...
          </span>
        </div>
      )}

      {/* Results */}
      {!loading && results && debouncedQuery.trim() && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-1.5 text-[10px] h-4">
                {totalCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="artists">
              Artists
              <Badge variant="secondary" className="ml-1.5 text-[10px] h-4">
                {results.artists?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="tracks">
              Tracks
              <Badge variant="secondary" className="ml-1.5 text-[10px] h-4">
                {results.tracks?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="albums">
              Albums
              <Badge variant="secondary" className="ml-1.5 text-[10px] h-4">
                {results.albums?.length || 0}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {allResults.length === 0 ? (
              <EmptyState query={debouncedQuery} />
            ) : (
              <div className="space-y-2">
                {allResults.map(renderResultCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="artists">
            {!results.artists || results.artists.length === 0 ? (
              <EmptyState query={debouncedQuery} type="artists" />
            ) : (
              <div className="space-y-2">
                {results.artists.map(renderResultCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tracks">
            {!results.tracks || results.tracks.length === 0 ? (
              <EmptyState query={debouncedQuery} type="tracks" />
            ) : (
              <div className="space-y-2">
                {results.tracks.map(renderResultCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="albums">
            {!results.albums || results.albums.length === 0 ? (
              <EmptyState query={debouncedQuery} type="albums" />
            ) : (
              <div className="space-y-2">
                {results.albums.map(renderResultCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Initial Empty State */}
      {!debouncedQuery.trim() && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Search across your entire listening history.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Try searching for an artist, song, or album name.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EmptyState({ query, type }: { query: string; type?: string }) {
  return (
    <div className="py-12 text-center">
      <Search className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
      <p className="text-sm text-muted-foreground">
        No {type !== "all" ? type : ""} results found for &quot;{query}&quot;
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        Try a different search term or check your uploaded data.
      </p>
    </div>
  );
}
