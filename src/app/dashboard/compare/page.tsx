"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComparisonChart } from "@/components/dashboard/ComparisonChart";
import { TasteCompatibility } from "@/components/dashboard/TasteCompatibility";
import {
  Loader2,
  ChevronDown,
  Users,
  BarChart3,
  Music,
  Clock,
  Heart,
} from "lucide-react";

interface Friend {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
}

interface StatsData {
  overview: {
    totalPlays: number;
    totalHours: number;
    uniqueArtists: number;
    uniqueTracks: number;
    uniqueAlbums: number;
    avgPlaysPerDay: number;
    avgMinutesPerDay: number;
    daysTracked: number;
  };
  topArtists: Array<{
    id: string;
    name: string;
    genres: string[];
    playCount: number;
    totalHours: number;
  }>;
  genres: Array<{
    genre: string;
    plays: number;
    percentage: number;
  }>;
}

export default function ComparePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string>("");
  const [myStats, setMyStats] = useState<StatsData | null>(null);
  const [friendStats, setFriendStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchFriends();
    fetchMyStats();
  }, [status]);

  async function fetchFriends() {
    try {
      const res = await fetch("/api/user/friends");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setFriends(data.data.friends || []);
        }
      }
    } catch (err) {
      console.error("Failed to fetch friends:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyStats() {
    try {
      const res = await fetch("/api/spotify/stats?timeRange=all_time");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setMyStats(data.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch own stats:", err);
    }
  }

  async function fetchFriendStats(friendId: string) {
    setComparing(true);
    setFriendStats(null);
    try {
      const res = await fetch(`/api/compare?friendId=${friendId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setFriendStats(data.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch friend stats:", err);
    } finally {
      setComparing(false);
    }
  }

  function handleSelectFriend(friendId: string) {
    setSelectedFriendId(friendId);
    setDropdownOpen(false);
    fetchFriendStats(friendId);
  }

  const selectedFriend = friends.find((f) => f.id === selectedFriendId);

  // Taste compatibility
  const compatibility = useMemo(() => {
    if (!myStats || !friendStats) return null;

    const myArtistIds = new Set(myStats.topArtists.map((a) => a.id));
    const friendArtistIds = new Set(friendStats.topArtists.map((a) => a.id));
    const sharedArtistCount = [...myArtistIds].filter((id) =>
      friendArtistIds.has(id),
    ).length;
    const totalArtistCount = new Set([...myArtistIds, ...friendArtistIds]).size;

    const myGenres = new Set(myStats.topArtists.flatMap((a) => a.genres || []));
    const friendGenres = new Set(
      friendStats.topArtists.flatMap((a) => a.genres || []),
    );
    const sharedGenreCount = [...myGenres].filter((g) =>
      friendGenres.has(g),
    ).length;
    const totalGenreCount = new Set([...myGenres, ...friendGenres]).size;

    // Shared unique genre names from genre stats
    const myGenreNames = new Set(myStats.genres.map((g) => g.genre));
    const friendGenreNames = new Set(friendStats.genres.map((g) => g.genre));
    const allSharedGenres = [...myGenreNames].filter((g) =>
      friendGenreNames.has(g),
    );
    const allUniqueGenres = new Set([...myGenreNames, ...friendGenreNames]);

    return {
      sharedArtists: sharedArtistCount,
      totalArtists: totalArtistCount,
      sharedGenres: Math.max(sharedGenreCount, allSharedGenres.length),
      totalGenres: Math.max(totalGenreCount, allUniqueGenres.size),
      allSharedGenres,
      myOnlyGenres: [...myGenreNames].filter((g) => !friendGenreNames.has(g)),
      friendOnlyGenres: [...friendGenreNames].filter(
        (g) => !myGenreNames.has(g),
      ),
      sharedArtistNames: myStats.topArtists
        .filter((a) => friendArtistIds.has(a.id))
        .map((a) => a.name),
    };
  }, [myStats, friendStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compare</h1>
          <p className="text-sm text-muted-foreground mt-1">
            See how your taste matches up with friends
          </p>
        </div>
      </div>

      {/* Friend Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-secondary border border-border rounded-lg text-sm text-foreground hover:bg-secondary/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                {selectedFriend ? (
                  <>
                    {selectedFriend.image ? (
                      <img
                        src={selectedFriend.image}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {selectedFriend.name?.[0] || "?"}
                      </div>
                    )}
                    <span className="font-medium">{selectedFriend.name}</span>
                    {selectedFriend.username && (
                      <span className="text-muted-foreground">
                        @{selectedFriend.username}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Select a friend to compare
                    </span>
                  </>
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                {friends.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                    No friends yet.{" "}
                    <a
                      href="/dashboard/friends"
                      className="text-primary hover:underline"
                    >
                      Add some friends
                    </a>{" "}
                    to compare!
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto">
                    {friends.map((friend) => (
                      <button
                        key={friend.id}
                        onClick={() => handleSelectFriend(friend.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary transition-colors text-left ${
                          selectedFriendId === friend.id ? "bg-secondary" : ""
                        }`}
                      >
                        {friend.image ? (
                          <img
                            src={friend.image}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            {friend.name?.[0] || "?"}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{friend.name}</p>
                          {friend.username && (
                            <p className="text-xs text-muted-foreground">
                              @{friend.username}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {comparing && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading friend&apos;s stats...
          </span>
        </div>
      )}

      {/* Comparison Content */}
      {myStats && friendStats && !comparing && (
        <div className="space-y-6">
          {/* Taste Compatibility */}
          {compatibility && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  Taste Compatibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TasteCompatibility
                  sharedArtists={compatibility.sharedArtists}
                  totalArtists={compatibility.totalArtists}
                  sharedGenres={compatibility.sharedGenres}
                  totalGenres={compatibility.totalGenres}
                />
              </CardContent>
            </Card>
          )}

          {/* Side-by-Side Headers */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div />
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-foreground">You</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-sm font-semibold text-foreground">
                {selectedFriend?.name}
              </span>
            </div>
          </div>

          {/* Stats Comparison */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Listening Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <ComparisonChart
                label="Total Plays"
                yours={myStats.overview.totalPlays}
                theirs={friendStats.overview.totalPlays}
                format="number"
              />
              <ComparisonChart
                label="Hours Listened"
                yours={myStats.overview.totalHours}
                theirs={friendStats.overview.totalHours}
                format="hours"
              />
              <ComparisonChart
                label="Unique Artists"
                yours={myStats.overview.uniqueArtists}
                theirs={friendStats.overview.uniqueArtists}
                format="number"
              />
              <ComparisonChart
                label="Unique Tracks"
                yours={myStats.overview.uniqueTracks}
                theirs={friendStats.overview.uniqueTracks}
                format="number"
              />
            </CardContent>
          </Card>

          {/* Listening Time Per Day */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Listening Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ComparisonChart
                label="Avg. Minutes Per Day"
                yours={myStats.overview.avgMinutesPerDay}
                theirs={friendStats.overview.avgMinutesPerDay}
                format="number"
              />
              <ComparisonChart
                label="Avg. Plays Per Day"
                yours={myStats.overview.avgPlaysPerDay}
                theirs={friendStats.overview.avgPlaysPerDay}
                format="number"
              />
              <ComparisonChart
                label="Days Tracked"
                yours={myStats.overview.daysTracked}
                theirs={friendStats.overview.daysTracked}
                format="number"
              />
            </CardContent>
          </Card>

          {/* Top 5 Artists Comparison */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Music className="w-4 h-4 text-primary" />
                Top 5 Artists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Your Top 5 */}
                <div>
                  <h4 className="text-sm font-medium text-green-400 mb-3">
                    Your Top 5
                  </h4>
                  <div className="space-y-2">
                    {myStats.topArtists.slice(0, 5).map((artist, i) => {
                      const isShared =
                        compatibility?.sharedArtistNames.includes(artist.name);
                      return (
                        <div
                          key={artist.id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50"
                        >
                          <span className="text-xs text-muted-foreground w-4">
                            {i + 1}
                          </span>
                          <span className="text-sm flex-1 truncate">
                            {artist.name}
                          </span>
                          {isShared && (
                            <Badge variant="secondary" className="text-[10px]">
                              Shared
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {artist.playCount.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Friend's Top 5 */}
                <div>
                  <h4 className="text-sm font-medium text-purple-400 mb-3">
                    {selectedFriend?.name}&apos;s Top 5
                  </h4>
                  <div className="space-y-2">
                    {friendStats.topArtists.slice(0, 5).map((artist, i) => {
                      const isShared =
                        compatibility?.sharedArtistNames.includes(artist.name);
                      return (
                        <div
                          key={artist.id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50"
                        >
                          <span className="text-xs text-muted-foreground w-4">
                            {i + 1}
                          </span>
                          <span className="text-sm flex-1 truncate">
                            {artist.name}
                          </span>
                          {isShared && (
                            <Badge variant="secondary" className="text-[10px]">
                              Shared
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {artist.playCount.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Genre Overlap */}
          {compatibility && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Genre Overlap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Shared Genres */}
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Shared Genres
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {compatibility.allSharedGenres.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          None found
                        </span>
                      ) : (
                        compatibility.allSharedGenres.map((genre) => (
                          <Badge
                            key={genre}
                            variant="default"
                            className="text-xs"
                          >
                            {genre}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Your Unique Genres */}
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <h4 className="text-xs font-medium text-green-400 uppercase tracking-wider mb-2">
                      Your Genres Only
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {compatibility.myOnlyGenres.slice(0, 10).map((genre) => (
                        <Badge
                          key={genre}
                          variant="outline"
                          className="text-xs"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Friend's Unique Genres */}
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <h4 className="text-xs font-medium text-purple-400 uppercase tracking-wider mb-2">
                      Their Genres Only
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {compatibility.friendOnlyGenres
                        .slice(0, 10)
                        .map((genre) => (
                          <Badge
                            key={genre}
                            variant="outline"
                            className="text-xs"
                          >
                            {genre}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!myStats && !comparing && (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Upload your Spotify data first to enable comparisons.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
