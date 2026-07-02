import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  computeOverview,
  computeTopArtists,
  computeTopTracks,
  computeTopAlbums,
  computeTopGenres,
  computeHourlyStats,
  computeDailyStats,
  computeMonthlyStats,
  computeListeningClock,
  computeHeatMap,
} from "@/lib/stats";
import type { ListeningEntry } from "@/lib/stats";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user.userId;

    // Fetch all listening history with related data
    const history = await db.listeningHistory.findMany({
      where: { userId },
      include: {
        track: {
          include: {
            artist: true,
            album: true,
          },
        },
        artist: true,
        album: true,
      },
      orderBy: { playedAt: "asc" },
    });

    // Transform into ListeningEntry format for stats engine
    const entries: ListeningEntry[] = history.map((h) => ({
      playedAt: h.playedAt,
      msPlayed: h.msPlayed,
      skipped: h.skipped,
      shuffle: h.shuffle,
      artistId: h.artistId,
      trackId: h.trackId,
      albumId: h.albumId,
      artistName: h.artist?.name ?? undefined,
      artistGenres: h.artist?.genres ?? undefined,
      artistImage: h.artist?.image ?? undefined,
      trackName: h.track?.name ?? undefined,
      trackImage: h.track?.album?.image ?? undefined,
      trackDurationMs: h.track?.durationMs ?? undefined,
      albumName: h.album?.name ?? undefined,
      albumImage: h.album?.image ?? undefined,
      albumReleaseDate: h.album?.releaseDate?.toISOString() ?? undefined,
    }));

    // Compute all stats
    const overview = computeOverview(entries);
    const topArtists = computeTopArtists(entries);
    const topTracks = computeTopTracks(entries);
    const topAlbums = computeTopAlbums(entries);
    const topGenres = computeTopGenres(entries);
    const hourlyStats = computeHourlyStats(entries);
    const dailyStats = computeDailyStats(entries);
    const monthlyStats = computeMonthlyStats(entries);
    const listeningClock = computeListeningClock(entries);
    const heatMap = computeHeatMap(entries, 365);

    const exportData = {
      exportedAt: new Date().toISOString(),
      userId,
      totalRecords: entries.length,
      overview,
      topArtists,
      topTracks,
      topAlbums,
      topGenres,
      hourlyStats,
      dailyStats,
      monthlyStats,
      listeningClock,
      heatMap,
    };

    const json = JSON.stringify(exportData, null, 2);

    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="riff-fm-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
