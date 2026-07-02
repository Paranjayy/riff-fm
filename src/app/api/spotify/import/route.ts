import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { SpotifyStreamEntry } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user.userId;
    const body = await request.json();
    const entries: SpotifyStreamEntry[] = body.entries;

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { success: false, error: "entries array is required" },
        { status: 400 },
      );
    }

    // Create an import record
    const imported = await db.importedData.create({
      data: {
        userId,
        source: "spotify_upload",
        status: "PROCESSING",
        recordsCount: entries.length,
      },
    });

    let importedCount = 0;
    let skippedCount = 0;

    // Process in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);

      for (const entry of batch) {
        // Skip entries without track data or with 0 ms played
        if (
          !entry.master_metadata_track_name ||
          !entry.master_metadata_album_artist_name ||
          entry.ms_played === 0
        ) {
          skippedCount++;
          continue;
        }

        const trackName = entry.master_metadata_track_name;
        const artistName = entry.master_metadata_album_artist_name;
        const albumName =
          entry.master_metadata_album_album_name || "Unknown Album";
        const spotifyTrackUri = entry.spotify_track_uri || "";
        const spotifyTrackId =
          spotifyTrackUri.replace("spotify:track:", "").split(":")[0] ||
          `local-${trackName}-${artistName}`;

        // Check for duplicate
        const playedAt = new Date(entry.ts);
        const existingHistory = await db.listeningHistory.findFirst({
          where: {
            userId,
            playedAt,
            track: { name: trackName },
          },
        });

        if (existingHistory) {
          skippedCount++;
          continue;
        }

        try {
          // Find or create artist
          let artist = await db.artist.findFirst({
            where: { name: artistName },
          });
          if (!artist) {
            artist = await db.artist.create({
              data: {
                spotifyId: `imported-${artistName.toLowerCase().replace(/\s+/g, "-")}`,
                name: artistName,
                genres: "[]",
              },
            });
          }

          // Find or create album
          let album = await db.album.findFirst({
            where: { name: albumName, artistId: artist.id },
          });
          if (!album) {
            album = await db.album.create({
              data: {
                spotifyId: `imported-${albumName.toLowerCase().replace(/\s+/g, "-")}-${artist.id.slice(0, 8)}`,
                name: albumName,
                artistId: artist.id,
              },
            });
          }

          // Find or create track
          let track = await db.track.findFirst({
            where: { name: trackName, artistId: artist.id },
          });
          if (!track) {
            track = await db.track.create({
              data: {
                spotifyId: spotifyTrackId,
                name: trackName,
                artistId: artist.id,
                albumId: album.id,
                durationMs: entry.ms_played,
              },
            });
          }

          // Create listening history entry
          await db.listeningHistory.create({
            data: {
              userId,
              trackId: track.id,
              artistId: artist.id,
              albumId: album.id,
              playedAt,
              msPlayed: entry.ms_played,
              platform: entry.platform || null,
              country: entry.conn_country || null,
              shuffle: entry.shuffle || false,
              skipped: entry.skipped || false,
              reasonStart: entry.reason_start || null,
              reasonEnd: entry.reason_end || null,
            },
          });

          importedCount++;
        } catch (entryError) {
          console.error("Failed to import entry:", entryError);
          skippedCount++;
        }
      }
    }

    // Update import record
    await db.importedData.update({
      where: { id: imported.id },
      data: {
        status: "COMPLETED",
        recordsCount: importedCount,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        imported: importedCount,
        skipped: skippedCount,
        total: entries.length,
      },
    });
  } catch (error) {
    console.error("Import API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
