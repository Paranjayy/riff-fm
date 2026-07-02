import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const type = searchParams.get("type") || "all";

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query parameter 'q' is required" },
        { status: 400 },
      );
    }

    const userId = session.user.userId;
    const likeQuery = `%${query}%`;
    const limit = 20;

    const results: Record<string, unknown[]> = {};

    // Search artists
    if (type === "all" || type === "artists") {
      const artists = await db.listeningHistory.groupBy({
        by: ["artistId"],
        where: {
          userId,
          artist: { name: { contains: likeQuery, mode: "insensitive" } },
        },
        _count: { id: true },
        _sum: { msPlayed: true },
        orderBy: { _count: { id: "desc" } },
        take: limit,
      });

      const artistIds = artists.map((a) => a.artistId);
      const artistDetails = await db.artist.findMany({
        where: { id: { in: artistIds } },
      });
      const artistMap = new Map(artistDetails.map((a) => [a.id, a]));

      results.artists = artists.map((a) => {
        const detail = artistMap.get(a.artistId);
        return {
          id: a.artistId,
          type: "artist" as const,
          name: detail?.name || "Unknown",
          image: detail?.image,
          playCount: a._count.id,
          totalMs: a._sum.msPlayed || 0,
          totalMinutes: (a._sum.msPlayed || 0) / 60000,
          spotifyUrl: detail?.url,
          genres: detail?.genres ? JSON.parse(detail.genres) : [],
        };
      });
    }

    // Search tracks
    if (type === "all" || type === "tracks") {
      const tracks = await db.listeningHistory.groupBy({
        by: ["trackId"],
        where: {
          userId,
          track: { name: { contains: likeQuery, mode: "insensitive" } },
        },
        _count: { id: true },
        _sum: { msPlayed: true },
        orderBy: { _count: { id: "desc" } },
        take: limit,
      });

      const trackIds = tracks.map((t) => t.trackId);
      const trackDetails = await db.track.findMany({
        where: { id: { in: trackIds } },
        include: { artist: true, album: true },
      });
      const trackMap = new Map(trackDetails.map((t) => [t.id, t]));

      results.tracks = tracks.map((t) => {
        const detail = trackMap.get(t.trackId);
        return {
          id: t.trackId,
          type: "track" as const,
          name: detail?.name || "Unknown",
          image: detail?.album?.image,
          artist: detail?.artist?.name || "Unknown",
          album: detail?.album?.name,
          playCount: t._count.id,
          totalMs: t._sum.msPlayed || 0,
          totalMinutes: (t._sum.msPlayed || 0) / 60000,
          durationMs: detail?.durationMs,
          spotifyUrl: detail?.url,
        };
      });
    }

    // Search albums
    if (type === "all" || type === "albums") {
      const albums = await db.listeningHistory.groupBy({
        by: ["albumId"],
        where: {
          userId,
          album: { name: { contains: likeQuery, mode: "insensitive" } },
        },
        _count: { id: true },
        _sum: { msPlayed: true },
        orderBy: { _count: { id: "desc" } },
        take: limit,
      });

      const albumIds = albums.map((a) => a.albumId);
      const albumDetails = await db.album.findMany({
        where: { id: { in: albumIds } },
        include: { artist: true },
      });
      const albumMap = new Map(albumDetails.map((a) => [a.id, a]));

      results.albums = albums.map((a) => {
        const detail = albumMap.get(a.albumId);
        return {
          id: a.albumId,
          type: "album" as const,
          name: detail?.name || "Unknown",
          image: detail?.image,
          artist: detail?.artist?.name || "Unknown",
          releaseDate: detail?.releaseDate?.toISOString(),
          playCount: a._count.id,
          totalMs: a._sum.msPlayed || 0,
          totalMinutes: (a._sum.msPlayed || 0) / 60000,
          totalTracks: detail?.totalTracks,
          spotifyUrl: detail?.url,
        };
      });
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
