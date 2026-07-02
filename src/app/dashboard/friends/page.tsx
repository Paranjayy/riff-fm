"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, X, Check, Search } from "lucide-react";

interface Friend {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  stats?: {
    totalPlays: number;
    totalHours: number;
    uniqueArtists: number;
  };
}

export default function FriendsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingSent, setPendingSent] = useState<Friend[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<Friend | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchFriends();
  }, [status]);

  async function fetchFriends() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/friends");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setFriends(data.data.friends || []);
          setPendingSent(data.data.pendingSent || []);
          setPendingReceived(data.data.pendingReceived || []);
        }
      }
    } catch (err) {
      console.error("Failed to fetch friends:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchUsername.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const res = await fetch(
        `/api/user/profile?username=${encodeURIComponent(searchUsername.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setSearchResult(data.data);
        }
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  }

  async function handleAddFriend(userId: string) {
    setSendingRequest(true);
    try {
      await fetch("/api/user/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      });
      setSearchResult(null);
      setSearchUsername("");
      fetchFriends();
    } catch (err) {
      console.error("Failed to send request:", err);
    } finally {
      setSendingRequest(false);
    }
  }

  async function handleAccept(friendId: string) {
    try {
      await fetch("/api/user/friends", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId, action: "accept" }),
      });
      fetchFriends();
    } catch (err) {
      console.error("Failed to accept:", err);
    }
  }

  async function handleReject(friendId: string) {
    try {
      await fetch("/api/user/friends", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId, action: "reject" }),
      });
      fetchFriends();
    } catch (err) {
      console.error("Failed to reject:", err);
    }
  }

  async function handleRemove(friendId: string) {
    try {
      await fetch("/api/user/friends", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
      });
      fetchFriends();
    } catch (err) {
      console.error("Failed to remove:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Friends</h1>

      {/* Add friend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add Friend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by username..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-9 pr-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !searchUsername.trim()}
              className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {searching ? "..." : "Search"}
            </button>
          </div>

          {searchResult && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-secondary">
              {searchResult.image ? (
                <img
                  src={searchResult.image}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                  {searchResult.name?.[0] || "?"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{searchResult.name}</p>
                <p className="text-xs text-muted-foreground">
                  @{searchResult.username || "unknown"}
                </p>
              </div>
              <button
                onClick={() => handleAddFriend(searchResult.id)}
                disabled={sendingRequest}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending requests */}
      {pendingReceived.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Pending Requests ({pendingReceived.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingReceived.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary"
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {p.name?.[0] || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      @{p.username || "unknown"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(p.id)}
                      className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReject(p.id)}
                      className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friends list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Friends ({friends.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No friends yet. Search for a username above to add someone!
            </p>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  {friend.image ? (
                    <img
                      src={friend.image}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {friend.name?.[0] || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{friend.name}</p>
                    <p className="text-xs text-muted-foreground">
                      @{friend.username || "unknown"}
                    </p>
                  </div>
                  {friend.stats && (
                    <div className="text-right text-xs text-muted-foreground hidden sm:block">
                      <p>{friend.stats.totalPlays.toLocaleString()} plays</p>
                      <p>{Math.round(friend.stats.totalHours)}h listened</p>
                    </div>
                  )}
                  {friend.username && (
                    <a
                      href={`/${friend.username}`}
                      className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Profile
                    </a>
                  )}
                  <button
                    onClick={() => handleRemove(friend.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    title="Remove friend"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sent requests */}
      {pendingSent.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Sent Requests ({pendingSent.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingSent.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary"
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {p.name?.[0] || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Request pending...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
