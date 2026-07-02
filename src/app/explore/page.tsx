"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, TrendingUp, Music, Mic2 } from "lucide-react";

const GENRE_OPTIONS = [
  "Pop", "Rock", "Hip-Hop", "R&B", "Electronic", "Jazz",
  "Classical", "Country", "Metal", "Indie", "Folk", "Latin",
  "K-Pop", "J-Pop", "Bollywood", "Punjabi",
];

const TRENDING_ARTISTS = [
  { name: "Trending artist data unavailable", note: "Connect with more users to populate this section" },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"artists" | "songs" | "users">("artists");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `/api/user/profile?username=${encodeURIComponent(searchQuery.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setResults([data.data]);
        } else {
          setResults([]);
        }
      }
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Explore</h1>
          <p className="text-muted-foreground">
            Discover artists, songs, and other users on riff.fm
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search ${searchType}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-9 pr-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              value={searchType}
              onChange={(e) =>
                setSearchType(e.target.value as "artists" | "songs" | "users")
              }
              className="px-3 py-3 bg-card border border-border rounded-xl text-sm text-foreground"
            >
              <option value="artists">Artists</option>
              <option value="songs">Songs</option>
              <option value="users">Users</option>
            </select>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {searching ? "..." : "Search"}
            </button>
          </div>

          {/* Search results */}
          {results.length > 0 && (
            <div className="mt-4 space-y-2">
              {results.map((user: any, idx: number) => (
                <a
                  key={idx}
                  href={`/${user.username}`}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold">
                      {user.name?.[0] || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">View →</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Genre Explorer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Music className="w-4 h-4" />
              Genre Explorer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1.5 bg-secondary rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 cursor-pointer transition-colors"
                >
                  {genre}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Discover section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Discover
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">
                Discover features will be available as more users join riff.fm.
              </p>
              <p className="text-xs mt-1">
                Invite your friends to unlock trending stats and recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
