import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

interface ProfilePageProps {
  params: { username: string };
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const user = await db.user.findUnique({
    where: { username: params.username },
    select: { name: true, bio: true, username: true },
  });
  if (!user) return { title: "User Not Found - riff.fm" };
  return {
    title: `${user.name || user.username} - riff.fm`,
    description: user.bio || `Check out ${user.name}'s music stats on riff.fm`,
  };
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const user = await db.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      image: true,
      createdAt: true,
      privacySettings: true,
      _count: {
        select: {
          listeningHistory: true,
          sentFriendRequests: true,
          receivedFriendRequests: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Check privacy
  if (user.privacySettings && !user.privacySettings.publicProfile) {
    // Allow self-view
    const session = await auth();
    if (session?.user?.id !== user.id) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Profile is private</h1>
            <p className="text-muted-foreground">
              This user has made their profile private.
            </p>
          </div>
        </div>
      );
    }
  }

  // Get basic stats
  const totalPlays = await db.listeningHistory.count({
    where: { userId: user.id },
  });

  const uniqueArtists = await db.listeningHistory.groupBy({
    by: ["artistId"],
    where: { userId: user.id },
  });

  const uniqueTracks = await db.listeningHistory.groupBy({
    by: ["trackId"],
    where: { userId: user.id },
  });

  // Get top artists
  const topArtists = await db.listeningHistory.groupBy({
    by: ["artistId"],
    where: { userId: user.id },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const artistIds = topArtists.map((a) => a.artistId);
  const artists = await db.artist.findMany({
    where: { id: { in: artistIds } },
  });
  const artistMap = new Map(artists.map((a) => [a.id, a]));

  const topArtistsList = topArtists.map((a, idx) => ({
    rank: idx + 1,
    name: artistMap.get(a.artistId)?.name || "Unknown",
    image: artistMap.get(a.artistId)?.image,
    plays: a._count.id,
    genres: artistMap.get(a.artistId)?.genres
      ? JSON.parse(artistMap.get(a.artistId)!.genres)
      : [],
  }));

  // Get top tracks
  const topTracks = await db.listeningHistory.groupBy({
    by: ["trackId"],
    where: { userId: user.id },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const trackIds = topTracks.map((t) => t.trackId);
  const tracks = await db.track.findMany({
    where: { id: { in: trackIds } },
    include: { artist: true, album: true },
  });
  const trackMap = new Map(tracks.map((t) => [t.id, t]));

  const topTracksList = topTracks.map((t, idx) => ({
    rank: idx + 1,
    name: trackMap.get(t.trackId)?.name || "Unknown",
    artist: trackMap.get(t.trackId)?.artist?.name || "Unknown",
    image: trackMap.get(t.trackId)?.album?.image,
    plays: t._count.id,
  }));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || ""}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {user.name?.[0] || "?"}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {user.name || user.username}
              </h1>
              {user.username && (
                <p className="text-muted-foreground text-sm">
                  @{user.username}
                </p>
              )}
              {user.bio && <p className="text-sm mt-1 max-w-md">{user.bio}</p>}
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>{totalPlays.toLocaleString()} plays</span>
                <span>{uniqueArtists.length} artists</span>
                <span>{uniqueTracks.length} tracks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Top Artists */}
        {(user.privacySettings?.showTopLists ?? true) &&
          topArtistsList.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Top Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {topArtistsList.map((artist) => (
                  <div
                    key={artist.rank}
                    className="rounded-xl bg-card border border-border p-3"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-secondary mb-2">
                      {artist.image ? (
                        <img
                          src={artist.image}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground">
                          🎤
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      #{artist.rank}
                    </p>
                    <p className="text-sm font-medium truncate">
                      {artist.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {artist.plays.toLocaleString()} plays
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Top Tracks */}
        {(user.privacySettings?.showTopLists ?? true) &&
          topTracksList.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Top Songs</h2>
              <div className="space-y-2">
                {topTracksList.map((track) => (
                  <div
                    key={track.rank}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
                  >
                    <span className="text-sm text-muted-foreground w-5 text-right tabular-nums">
                      {track.rank}
                    </span>
                    {track.image ? (
                      <img
                        src={track.image}
                        alt=""
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center text-muted-foreground text-xs">
                        🎵
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {track.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {track.plays.toLocaleString()} plays
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Member since */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          Member since{" "}
          {new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}
