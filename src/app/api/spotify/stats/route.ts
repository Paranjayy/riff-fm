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
    const timeRange = searchParams.get("timeRange") || "medium_term";
    const userId = session.user.userId;

    // Calculate date cutoff based on time range
    const now = new Date();
    let cutoffDate: Date;

    switch (timeRange) {
      case "short_term":
        cutoffDate = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000);
        break;
      case "long_term":
        cutoffDate = new Date(now.getTime() - 52 * 7 * 24 * 60 * 60 * 1000);
        break;
      case "all_time":
        cutoffDate = new Date(0);
        break;
      case "medium_term":
      default:
        cutoffDate = new Date(now.getTime() - 26 * 7 * 24 * 60 * 60 * 1000);
        break;
    }

    // Fetch listening history for the time range
    const history = await db.listeningHistory.findMany({
      where: {
        userId,
        playedAt: { gte: cutoffDate },
      },
      include: {
        track: { include: { artist: true, album: true } },
        artist: true,
        album: true,
      },
      orderBy: { playedAt: "desc" },
    });

    if (history.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          overview: null,
          topArtists: [],
          topTracks: [],
          topAlbums: [],
          genres: [],
          clockData: [],
          heatMap: [],
          recentPlays: [],
        },
      });
    }

    // ─── Overview Stats ───────────────────────────────────────
    const totalPlays = history.length;
    const totalMs = history.reduce((sum, h) => sum + h.msPlayed, 0);
    const totalMinutes = totalMs / 60000;
    const totalHours = totalMinutes / 60;
    const totalDays = totalHours / 24;

    const uniqueArtistIds = new Set(history.map((h) => h.artistId));
    const uniqueTrackIds = new Set(history.map((h) => h.trackId));
    const uniqueAlbumIds = new Set(history.map((h) => h.albumId));

    const uniqueArtists = uniqueArtistIds.size;
    const uniqueTracks = uniqueTrackIds.size;
    const uniqueAlbums = uniqueAlbumIds.size;

    // Days tracked
    const daySet = new Set(
      history.map((h) => h.playedAt.toISOString().slice(0, 10)),
    );
    const daysTracked = daySet.size || 1;

    const avgPlaysPerDay = totalPlays / daysTracked;
    const avgMinutesPerDay = totalMinutes / daysTracked;

    // Skip and shuffle rates
    const skips = history.filter((h) => h.skipped).length;
    const shuffles = history.filter((h) => h.shuffle).length;
    const skipRate = (skips / totalPlays) * 100;
    const shuffleRate = (shuffles / totalPlays) * 100;

    // Most active hour
    const hourCounts: Record<number, number> = {};
    history.forEach((h) => {
      const hour = h.playedAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const mostActiveHour = parseInt(
      Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "0",
    );

    // Most active day
    const dayCounts: Record<string, number> = {};
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    history.forEach((h) => {
      const day = dayNames[h.playedAt.getDay()];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const mostActiveDay =
      Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // First and last played
    const sortedByDate = [...history].sort(
      (a, b) => a.playedAt.getTime() - b.playedAt.getTime(),
    );
    const firstPlayed = sortedByDate[0]?.playedAt.toISOString() || "";
    const lastPlayed =
      sortedByDate[sortedByDate.length - 1]?.playedAt.toISOString() || "";

    // Top genre
    const genreCounts: Record<string, number> = {};
    history.forEach((h) => {
      try {
        const genres = JSON.parse(h.artist.genres || "[]");
        genres.forEach((g: string) => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      } catch {}
    });
    const topGenre =
      Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    const overview = {
      totalPlays,
      totalMinutes,
      totalHours,
      totalDays,
      uniqueArtists,
      uniqueTracks,
      uniqueAlbums,
      avgPlaysPerDay,
      avgMinutesPerDay,
      topGenre,
      firstPlayed,
      lastPlayed,
      daysTracked,
      skipRate,
      shuffleRate,
      mostActiveHour,
      mostActiveDay,
    };

    // ─── Top Artists ─────────────────────────────────────────
    const artistPlayCounts: Record<
      string,
      { count: number; ms: number; artistId: string }
    > = {};
    history.forEach((h) => {
      const id = h.artistId;
      if (!artistPlayCounts[id]) {
        artistPlayCounts[id] = { count: 0, ms: 0, artistId: id };
      }
      artistPlayCounts[id].count++;
      artistPlayCounts[id].ms += h.msPlayed;
    });

    const sortedArtists = Object.values(artistPlayCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 100);

    const artistDetails = await db.artist.findMany({
      where: { id: { in: sortedArtists.map((a) => a.artistId) } },
    });
    const artistDetailMap = new Map(artistDetails.map((a) => [a.id, a]));

    const topArtists = sortedArtists.map((a, idx) => {
      const detail = artistDetailMap.get(a.artistId);
      return {
        id: a.artistId,
        name: detail?.name || "Unknown",
        image: detail?.image,
        playCount: a.count,
        totalMs: a.ms,
        totalMinutes: a.ms / 60000,
        totalHours: a.ms / 3600000,
        rank: idx + 1,
        percentage: (a.count / totalPlays) * 100,
        spotifyUrl: detail?.url,
        genres: detail?.genres ? JSON.parse(detail.genres) : [],
      };
    });

    // ─── Top Tracks ──────────────────────────────────────────
    const trackPlayCounts: Record<
      string,
      { count: number; ms: number; trackId: string }
    > = {};
    history.forEach((h) => {
      const id = h.trackId;
      if (!trackPlayCounts[id]) {
        trackPlayCounts[id] = { count: 0, ms: 0, trackId: id };
      }
      trackPlayCounts[id].count++;
      trackPlayCounts[id].ms += h.msPlayed;
    });

    const sortedTracks = Object.values(trackPlayCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 100);

    const trackDetails = await db.track.findMany({
      where: { id: { in: sortedTracks.map((t) => t.trackId) } },
      include: { artist: true, album: true },
    });
    const trackDetailMap = new Map(trackDetails.map((t) => [t.id, t]));

    const topTracks = sortedTracks.map((t, idx) => {
      const detail = trackDetailMap.get(t.trackId);
      return {
        id: t.trackId,
        name: detail?.name || "Unknown",
        image: detail?.album?.image,
        subtitle: detail?.artist?.name,
        playCount: t.count,
        totalMs: t.ms,
        totalMinutes: t.ms / 60000,
        totalHours: t.ms / 3600000,
        rank: idx + 1,
        percentage: (t.count / totalPlays) * 100,
        spotifyUrl: detail?.url,
        duration: detail?.durationMs,
      };
    });

    // ─── Top Albums ──────────────────────────────────────────
    const albumPlayCounts: Record<
      string,
      { count: number; ms: number; albumId: string }
    > = {};
    history.forEach((h) => {
      const id = h.albumId;
      if (!albumPlayCounts[id]) {
        albumPlayCounts[id] = { count: 0, ms: 0, albumId: id };
      }
      albumPlayCounts[id].count++;
      albumPlayCounts[id].ms += h.msPlayed;
    });

    const sortedAlbums = Object.values(albumPlayCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 100);

    const albumDetails = await db.album.findMany({
      where: { id: { in: sortedAlbums.map((a) => a.albumId) } },
      include: { artist: true },
    });
    const albumDetailMap = new Map(albumDetails.map((a) => [a.id, a]));

    const topAlbums = sortedAlbums.map((a, idx) => {
      const detail = albumDetailMap.get(a.albumId);
      return {
        id: a.albumId,
        name: detail?.name || "Unknown",
        image: detail?.image,
        subtitle: detail?.artist?.name,
        playCount: a.count,
        totalMs: a.ms,
        totalMinutes: a.ms / 60000,
        totalHours: a.ms / 3600000,
        rank: idx + 1,
        percentage: (a.count / totalPlays) * 100,
        spotifyUrl: detail?.url,
        releaseDate: detail?.releaseDate?.toISOString(),
      };
    });

    // ─── Genres ──────────────────────────────────────────────
    const genreMinutes: Record<string, { plays: number; minutes: number }> = {};
    history.forEach((h) => {
      try {
        const genres = JSON.parse(h.artist.genres || "[]");
        genres.forEach((g: string) => {
          if (!genreMinutes[g]) genreMinutes[g] = { plays: 0, minutes: 0 };
          genreMinutes[g].plays++;
          genreMinutes[g].minutes += h.msPlayed / 60000;
        });
      } catch {}
    });

    const genres = Object.entries(genreMinutes)
      .map(([genre, data]) => ({
        genre,
        plays: data.plays,
        minutes: data.minutes,
        percentage: (data.plays / totalPlays) * 100,
      }))
      .sort((a, b) => b.plays - a.plays);

    // ─── Clock Data ──────────────────────────────────────────
    const clockMap: Record<string, { plays: number; minutes: number }> = {};
    history.forEach((h) => {
      const hour = h.playedAt.getHours();
      const day = dayNames[h.playedAt.getDay()];
      const key = `${hour}-${day}`;
      if (!clockMap[key]) clockMap[key] = { plays: 0, minutes: 0 };
      clockMap[key].plays++;
      clockMap[key].minutes += h.msPlayed / 60000;
    });

    const clockData = Object.entries(clockMap).map(([key, data]) => {
      const [hour, day] = key.split("-");
      return {
        hour: parseInt(hour),
        day,
        plays: data.plays,
        minutes: data.minutes,
      };
    });

    // ─── Heat Map ────────────────────────────────────────────
    const heatMapMap: Record<string, { plays: number; minutes: number }> = {};
    history.forEach((h) => {
      const date = h.playedAt.toISOString().slice(0, 10);
      if (!heatMapMap[date]) heatMapMap[date] = { plays: 0, minutes: 0 };
      heatMapMap[date].plays++;
      heatMapMap[date].minutes += h.msPlayed / 60000;
    });

    const allPlays = Object.values(heatMapMap).map((d) => d.plays);
    const maxDayPlays = Math.max(...allPlays, 1);

    const heatMap = Object.entries(heatMapMap)
      .map(([date, data]) => ({
        date,
        plays: data.plays,
        minutes: data.minutes,
        level:
          data.plays === 0
            ? (0 as const)
            : data.plays / maxDayPlays <= 0.25
              ? (1 as const)
              : data.plays / maxDayPlays <= 0.5
                ? (2 as const)
                : data.plays / maxDayPlays <= 0.75
                  ? (3 as const)
                  : (4 as const),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ─── Recent Plays ────────────────────────────────────────
    const recentPlays = history.slice(0, 20);

    return NextResponse.json({
      success: true,
      data: {
        overview,
        topArtists,
        topTracks,
        topAlbums,
        genres,
        clockData,
        heatMap,
        recentPlays,
      },
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
