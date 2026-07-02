import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";

const prisma = new PrismaClient();

// ─── Config ────────────────────────────────────────────────────────
const BATCH_SIZE = 100;

const USERS = [
  {
    name: "paranjay",
    email: "paranjay@riff.fm",
    username: "paranjay",
    zipPath: "/Users/paranjay/Downloads/Telegram Desktop/my_spotify_data.zip",
    extractDir: "/tmp/spotify_data",
  },
  {
    name: "purvjeet",
    email: "purvjeet@riff.fm",
    username: "purvjeet",
    zipPath: "/Users/paranjay/Downloads/purvjeet_spotify_data.zip",
    extractDir: "/tmp/purvjeet_data",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────

/** Deterministic fake Spotify ID from a string */
function fakeSpotifyId(seed: string, prefix: string): string {
  const hash = createHash("md5").update(seed).digest("hex").slice(0, 22);
  return `seed:${prefix}:${hash}`;
}

function extractZip(zipPath: string, destDir: string) {
  if (!existsSync(zipPath)) {
    console.warn(`  ⚠ Zip not found: ${zipPath}, skipping`);
    return false;
  }
  console.log(`  📦 Extracting ${zipPath} → ${destDir}`);
  execSync(`rm -rf "${destDir}" && mkdir -p "${destDir}" && unzip -o "${zipPath}" -d "${destDir}"`, {
    stdio: "pipe",
  });
  return true;
}

function loadJsonFiles(dir: string): any[] {
  const historyDir = join(dir, "Spotify Extended Streaming History");
  if (!existsSync(historyDir)) return [];

  const files = readdirSync(historyDir).filter((f) => f.endsWith(".json"));
  const entries: any[] = [];
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(historyDir, file), "utf-8"));
    if (Array.isArray(data)) entries.push(...data);
  }
  return entries;
}

interface StreamEntry {
  ts: string;
  platform: string;
  ms_played: number;
  conn_country: string;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  spotify_track_uri: string | null;
  reason_start: string | null;
  reason_end: string | null;
  shuffle: boolean;
  skipped: boolean;
}

function isValid(entry: StreamEntry): boolean {
  return !!(
    entry.master_metadata_track_name &&
    entry.master_metadata_album_artist_name &&
    entry.master_metadata_album_album_name &&
    entry.spotify_track_uri
  );
}

function extractTrackId(uri: string): string {
  // spotify:track:XXXXXXXXXX
  return uri.split(":").pop() || uri;
}

async function batchInsert<T>(
  items: T[],
  insertFn: (batch: T[]) => Promise<any>,
  label: string
): Promise<number> {
  let total = 0;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    await insertFn(batch);
    total += batch.length;
    if (total % 500 === 0 || i + BATCH_SIZE >= items.length) {
      console.log(`    ${label}: ${total}/${items.length}`);
    }
  }
  return total;
}

// ─── Main ──────────────────────────────────────────────────────────

async function main() {
  console.log("🎵 riff.fm Database Seed\n");

  // 1. Extract zips and load all entries per user
  const userEntries = new Map<string, StreamEntry[]>();

  for (const user of USERS) {
    console.log(`📂 Processing ${user.name}...`);
    extractZip(user.zipPath, user.extractDir);
    const entries = loadJsonFiles(user.extractDir);
    const valid = entries.filter(isValid) as StreamEntry[];
    console.log(`  ✓ ${valid.length} valid entries (from ${entries.length} total)`);
    userEntries.set(user.name, valid);
  }

  // 2. Create users
  console.log("\n👤 Creating users...");
  const userMap = new Map<string, string>(); // name → id

  for (const user of USERS) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        username: user.name,
        emailVerified: new Date(),
        spotifyData: { placeholder: true },
      },
    });
    userMap.set(user.name, created.id);
    console.log(`  ✓ ${user.name} (${created.id})`);
  }

  // 3. Collect unique artists, albums, tracks across all users
  console.log("\n🔍 Scanning entries for unique entities...");

  const artistMap = new Map<string, { name: string; tracks: Set<string>; albums: Set<string> }>();
  const albumMap = new Map<
    string,
    { name: string; artist: string; tracks: Set<string> }
  >();
  const trackMap = new Map<
    string,
    {
      name: string;
      artist: string;
      album: string;
      durationMs: number;
      spotifyId: string;
    }
  >();

  let skippedEntries = 0;
  let totalEntries = 0;

  for (const [, entries] of userEntries) {
    for (const e of entries) {
      totalEntries++;
      const artistName = e.master_metadata_album_artist_name!;
      const albumName = e.master_metadata_album_album_name!;
      const trackName = e.master_metadata_track_name!;
      const trackId = extractTrackId(e.spotify_track_uri!);
      const artistKey = artistName.toLowerCase();
      const albumKey = `${artistKey}::${albumName.toLowerCase()}`;
      const trackKey = `${trackId}`;

      if (!artistMap.has(artistKey)) {
        artistMap.set(artistKey, { name: artistName, tracks: new Set(), albums: new Set() });
      }
      artistMap.get(artistKey)!.tracks.add(trackKey);
      artistMap.get(artistKey)!.albums.add(albumKey);

      if (!albumMap.has(albumKey)) {
        albumMap.set(albumKey, { name: albumName, artist: artistKey, tracks: new Set() });
      }
      albumMap.get(albumKey)!.tracks.add(trackKey);

      if (!trackMap.has(trackKey)) {
        trackMap.set(trackKey, {
          name: trackName,
          artist: artistKey,
          album: albumKey,
          durationMs: e.ms_played,
          spotifyId: trackId,
        });
      }
    }
  }

  console.log(`  Artists: ${artistMap.size}`);
  console.log(`  Albums:  ${albumMap.size}`);
  console.log(`  Tracks:  ${trackMap.size}`);

  // 4. Insert artists
  console.log("\n🎤 Creating artists...");
  const artistIdMap = new Map<string, string>(); // artistKey → db id

  const artistEntries = Array.from(artistMap.entries());
  await batchInsert(
    artistEntries,
    async (batch) => {
      const results = await Promise.all(
        batch.map(async ([key, data]) => {
          const spotifyId = fakeSpotifyId(data.name, "artist");
          const record = await prisma.artist.upsert({
            where: { spotifyId },
            update: { name: data.name },
            create: {
              spotifyId,
              name: data.name,
              genres: "[]",
              popularity: 0,
              followers: 0,
            },
          });
          artistIdMap.set(key, record.id);
          return record;
        })
      );
      return results;
    },
    "artists"
  );
  console.log(`  ✓ ${artistIdMap.size} artists created`);

  // 5. Insert albums
  console.log("\n💿 Creating albums...");
  const albumIdMap = new Map<string, string>();

  const albumEntries = Array.from(albumMap.entries());
  await batchInsert(
    albumEntries,
    async (batch) => {
      const results = await Promise.all(
        batch.map(async ([key, data]) => {
          const spotifyId = fakeSpotifyId(`${data.artist}::${data.name}`, "album");
          const artistDbId = artistIdMap.get(data.artist)!;
          const record = await prisma.album.upsert({
            where: { spotifyId },
            update: { name: data.name },
            create: {
              spotifyId,
              name: data.name,
              artistId: artistDbId,
              totalTracks: data.tracks.size,
            },
          });
          albumIdMap.set(key, record.id);
          return record;
        })
      );
      return results;
    },
    "albums"
  );
  console.log(`  ✓ ${albumIdMap.size} albums created`);

  // 6. Insert tracks
  console.log("\n🎶 Creating tracks...");
  const trackIdMap = new Map<string, string>(); // trackKey → db id

  const trackEntries = Array.from(trackMap.entries());
  await batchInsert(
    trackEntries,
    async (batch) => {
      const results = await Promise.all(
        batch.map(async ([key, data]) => {
          const artistDbId = artistIdMap.get(data.artist)!;
          const albumDbId = albumIdMap.get(data.album)!;
          const record = await prisma.track.upsert({
            where: { spotifyId: data.spotifyId },
            update: { name: data.name },
            create: {
              spotifyId: data.spotifyId,
              name: data.name,
              durationMs: data.durationMs,
              artistId: artistDbId,
              albumId: albumDbId,
            },
          });
          trackIdMap.set(key, record.id);
          return record;
        })
      );
      return results;
    },
    "tracks"
  );
  console.log(`  ✓ ${trackIdMap.size} tracks created`);

  // 7. Insert listening history
  console.log("\n📊 Creating listening history...");

  // Deduplicate by userId + trackDbId + playedAt timestamp
  const historySeen = new Set<string>();
  const historyRows: {
    userId: string;
    trackId: string;
    artistId: string;
    albumId: string;
    playedAt: Date;
    msPlayed: number;
    platform: string;
    country: string;
    shuffle: boolean;
    skipped: boolean;
    reasonStart: string;
    reasonEnd: string;
  }[] = [];

  for (const [userName, entries] of userEntries) {
    const userId = userMap.get(userName)!;
    for (const e of entries) {
      const trackKey = extractTrackId(e.spotify_track_uri!);
      const artistKey = e.master_metadata_album_artist_name!.toLowerCase();
      const albumKey = `${artistKey}::${e.master_metadata_album_album_name!.toLowerCase()}`;
      const trackDbId = trackIdMap.get(trackKey);
      const artistDbId = artistIdMap.get(artistKey);
      const albumDbId = albumIdMap.get(albumKey);

      if (!trackDbId || !artistDbId || !albumDbId) {
        skippedEntries++;
        continue;
      }

      const playedAt = new Date(e.ts);
      const dedupKey = `${userId}::${trackDbId}::${playedAt.toISOString()}`;

      if (historySeen.has(dedupKey)) continue;
      historySeen.add(dedupKey);

      historyRows.push({
        userId,
        trackId: trackDbId,
        artistId: artistDbId,
        albumId: albumDbId,
        playedAt,
        msPlayed: e.ms_played,
        platform: e.platform || null as any,
        country: e.conn_country || null as any,
        shuffle: e.shuffle || false,
        skipped: e.skipped || false,
        reasonStart: e.reason_start || null as any,
        reasonEnd: e.reason_end || null as any,
      });
    }
  }

  console.log(`  Total unique history rows: ${historyRows.length}`);
  if (skippedEntries > 0) {
    console.log(`  ⚠ Skipped ${skippedEntries} entries (missing entity refs)`);
  }

  let historyCount = 0;
  for (let i = 0; i < historyRows.length; i += BATCH_SIZE) {
    const batch = historyRows.slice(i, i + BATCH_SIZE);
    await prisma.listeningHistory.createMany({ data: batch });
    historyCount += batch.length;
    if (historyCount % 1000 === 0 || i + BATCH_SIZE >= historyRows.length) {
      console.log(`    history: ${historyCount}/${historyRows.length}`);
    }
  }

  console.log(`  ✓ ${historyCount} history records created`);

  // 8. Summary
  const counts = {
    users: await prisma.user.count(),
    artists: await prisma.artist.count(),
    albums: await prisma.album.count(),
    tracks: await prisma.track.count(),
    history: await prisma.listeningHistory.count(),
  };

  console.log("\n✅ Seed complete!\n");
  console.log("  Users:    ", counts.users);
  console.log("  Artists:  ", counts.artists);
  console.log("  Albums:   ", counts.albums);
  console.log("  Tracks:   ", counts.tracks);
  console.log("  History:  ", counts.history);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
