import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  computeOverview,
  computeTopArtists,
  computeTopTracks,
  computeTopGenres,
} from "@/lib/stats";
import type { ListeningEntry } from "@/lib/stats";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { success: false, error: "username query parameter is required" },
        { status: 400 },
      );
    }

    // Fetch user with privacy settings
    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        createdAt: true,
        privacySettings: {
          select: {
            publicProfile: true,
            showStats: true,
            showTopLists: true,
            showListening: true,
            showFriends: true,
            showHistory: true,
            showGenres: true,
            showHours: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    if (!user.privacySettings?.publicProfile) {
      return NextResponse.json(
        { success: false, error: "This profile is private" },
        { status: 403 },
      );
    }

    const privacy = user.privacySettings;

    // Fetch listening history for stats (only if allowed by privacy)
    let overview = null;
    let topArtists: any[] = [];
    let topTracks: any[] = [];
    let topGenres: any[] = [];

    if (privacy.showStats || privacy.showTopLists) {
      const history = await db.listeningHistory.findMany({
        where: { userId: user.id },
        include: {
          track: {
            include: { artist: true, album: true },
          },
          artist: true,
          album: true,
        },
        orderBy: { playedAt: "asc" },
      });

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

      if (privacy.showStats) {
        overview = computeOverview(entries);
      }

      if (privacy.showTopLists) {
        topArtists = computeTopArtists(entries).slice(0, 10);
        topTracks = computeTopTracks(entries).slice(0, 10);
        topGenres = privacy.showGenres
          ? computeTopGenres(entries).slice(0, 10)
          : [];
      }
    }

    // Build public-safe response
    const profile: Record<string, unknown> = {
      name: user.name,
      username: user.username,
      bio: user.bio,
      image: user.image,
      joinedAt: user.createdAt,
    };

    if (overview) {
      profile.stats = overview;
    }

    if (privacy.showTopLists) {
      profile.topArtists = topArtists;
      profile.topTracks = topTracks;
    }

    if (privacy.showGenres) {
      profile.topGenres = topGenres;
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Share API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
