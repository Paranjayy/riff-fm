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
    const friendId = searchParams.get("friendId");

    if (!friendId) {
      return NextResponse.json(
        { success: false, error: "friendId is required" },
        { status: 400 },
      );
    }

    // Verify friendship
    const friendship = await db.friend.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: session.user.userId, receiverId: friendId },
          { senderId: friendId, receiverId: session.user.userId },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { success: false, error: "Not friends with this user" },
        { status: 403 },
      );
    }

    // Check friend's privacy settings
    const friendPrivacy = await db.privacySettings.findUnique({
      where: { userId: friendId },
    });

    if (friendPrivacy && !friendPrivacy.publicProfile) {
      return NextResponse.json(
        { success: false, error: "This user's profile is private" },
        { status: 403 },
      );
    }

    async function getUserStats(userId: string) {
      const history = await db.listeningHistory.findMany({
        where: { userId },
        include: {
          track: { include: { artist: true, album: true } },
          artist: true,
          album: true,
        },
        orderBy: { playedAt: "desc" },
      });

      if (history.length === 0) {
        return {
          overview: null,
          topArtists: [],
          genres: [],
        };
      }

      // Overview
      const totalPlays = history.length;
      const totalMs = history.reduce((sum, h) => sum + h.msPlayed, 0);
      const totalMinutes = totalMs / 60000;
      const totalHours = totalMinutes / 60;
      const totalDays = totalHours / 24;

      const uniqueArtists = new Set(history.map((h) => h.artistId)).size;
      const uniqueTracks = new Set(history.map((h) => h.trackId)).size;
      const uniqueAlbums = new Set(history.map((h) => h.albumId)).size;

      const daySet = new Set(
        history.map((h) => h.playedAt.toISOString().slice(0, 10)),
      );
      const daysTracked = daySet.size || 1;

      const avgPlaysPerDay = totalPlays / daysTracked;
      const avgMinutesPerDay = totalMinutes / daysTracked;

      // Top Artists
      const artistPlayCounts: Record<
        string,
        { count: number; ms: number }
      > = {};
      history.forEach((h) => {
        if (!artistPlayCounts[h.artistId])
          artistPlayCounts[h.artistId] = { count: 0, ms: 0 };
        artistPlayCounts[h.artistId].count++;
        artistPlayCounts[h.artistId].ms += h.msPlayed;
      });

      const sortedArtists = Object.entries(artistPlayCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 20);

      const artistDetails = await db.artist.findMany({
        where: { id: { in: sortedArtists.map(([id]) => id) } },
      });
      const artistDetailMap = new Map(artistDetails.map((a) => [a.id, a]));

      const topArtists = sortedArtists.map(([artistId, data], idx) => {
        const detail = artistDetailMap.get(artistId);
        return {
          id: artistId,
          name: detail?.name || "Unknown",
          genres: detail?.genres ? JSON.parse(detail.genres) : [],
          playCount: data.count,
          totalHours: data.ms / 3600000,
          rank: idx + 1,
        };
      });

      // Genres
      const genreCounts: Record<string, { plays: number; minutes: number }> = {};
      history.forEach((h) => {
        try {
          const genres = JSON.parse(h.artist.genres || "[]");
          genres.forEach((g: string) => {
            if (!genreCounts[g]) genreCounts[g] = { plays: 0, minutes: 0 };
            genreCounts[g].plays++;
            genreCounts[g].minutes += h.msPlayed / 60000;
          });
        } catch {}
      });

      const genres = Object.entries(genreCounts)
        .map(([genre, data]) => ({
          genre,
          plays: data.plays,
          minutes: data.minutes,
          percentage: (data.plays / totalPlays) * 100,
        }))
        .sort((a, b) => b.plays - a.plays);

      return {
        overview: {
          totalPlays,
          totalHours,
          uniqueArtists,
          uniqueTracks,
          uniqueAlbums,
          avgPlaysPerDay,
          avgMinutesPerDay,
          daysTracked,
        },
        topArtists,
        genres,
      };
    }

    const friendStats = await getUserStats(friendId);

    return NextResponse.json({ success: true, data: friendStats });
  } catch (error) {
    console.error("Compare API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
