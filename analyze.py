#!/usr/bin/env python3
import json
import os
from collections import Counter, defaultdict
from datetime import datetime, timedelta


def load_data(base_dir):
    """Load all audio streaming history JSON files."""
    entries = []
    history_dir = os.path.join(base_dir, "Spotify Extended Streaming History")
    if not os.path.exists(history_dir):
        return entries
    for f in sorted(os.listdir(history_dir)):
        if f.startswith("Streaming_History_Audio") and f.endswith(".json"):
            with open(os.path.join(history_dir, f), "r") as fh:
                data = json.load(fh)
                entries.extend(data)
    return entries


def analyze(entries, name):
    """Comprehensive analysis of streaming history."""
    # Filter only entries with track data
    tracks = [e for e in entries if e.get("master_metadata_track_name")]

    if not tracks:
        return {"name": name, "total_entries": len(entries), "tracks": 0}

    # Basic stats
    total_ms = sum(t["ms_played"] for t in tracks)
    total_hours = total_ms / 3600000
    total_days = total_hours / 24

    # Unique counts
    artists = set()
    albums = set()
    track_names = set()
    for t in tracks:
        artists.add(t.get("master_metadata_album_artist_name", "Unknown"))
        albums.add(t.get("master_metadata_album_album_name", "Unknown"))
        track_names.add(t.get("master_metadata_track_name", "Unknown"))

    # Play counts
    artist_plays = Counter()
    artist_ms = Counter()
    album_plays = Counter()
    album_ms = Counter()
    track_plays = Counter()
    track_ms = Counter()

    for t in tracks:
        a = t.get("master_metadata_album_artist_name", "Unknown")
        al = t.get("master_metadata_album_album_name", "Unknown")
        tr = t.get("master_metadata_track_name", "Unknown")
        ms = t["ms_played"]

        artist_plays[a] += 1
        artist_ms[a] += ms
        album_plays[al] += 1
        album_ms[al] += ms
        track_plays[tr] += 1
        track_ms[tr] += ms

    # Time analysis
    hours_of_day = Counter()
    days_of_week = Counter()
    months = Counter()
    years = Counter()

    for t in tracks:
        dt = datetime.fromisoformat(t["ts"].replace("Z", "+00:00"))
        hours_of_day[dt.hour] += 1
        days_of_week[dt.strftime("%A")] += 1
        months[dt.strftime("%B %Y")] += 1
        years[dt.year] += 1

    # Skip and shuffle rates
    skips = sum(1 for t in tracks if t.get("skipped", False))
    shuffles = sum(1 for t in tracks if t.get("shuffle", False))
    skip_rate = (skips / len(tracks)) * 100
    shuffle_rate = (shuffles / len(tracks)) * 100

    # Platform usage
    platforms = Counter(t.get("platform", "unknown") for t in tracks)

    # Country usage
    countries = Counter(t.get("conn_country", "unknown") for t in tracks)

    # Listening patterns
    dates = set()
    for t in tracks:
        dt = datetime.fromisoformat(t["ts"].replace("Z", "+00:00"))
        dates.add(dt.date())

    first_play = min(dates)
    last_play = max(dates)
    days_tracked = len(dates)
    avg_plays_per_day = len(tracks) / max(days_tracked, 1)
    avg_hours_per_day = total_hours / max(days_tracked, 1)

    # Most active day/hour
    most_active_hour = hours_of_day.most_common(1)[0] if hours_of_day else (0, 0)
    most_active_day = days_of_week.most_common(1)[0] if days_of_week else ("N/A", 0)

    # Unique tracks per month
    monthly_unique = defaultdict(set)
    for t in tracks:
        dt = datetime.fromisoformat(t["ts"].replace("Z", "+00:00"))
        key = dt.strftime("%Y-%m")
        monthly_unique[key].add(t.get("master_metadata_track_name"))

    # Listening streaks
    sorted_dates = sorted(dates)
    streaks = []
    current_streak = 1
    for i in range(1, len(sorted_dates)):
        if (sorted_dates[i] - sorted_dates[i - 1]).days == 1:
            current_streak += 1
        else:
            streaks.append(current_streak)
            current_streak = 1
    streaks.append(current_streak)
    longest_streak = max(streaks) if streaks else 0

    # Return rate (re-listening to same tracks)
    track_play_counts = list(track_plays.values())
    avg_replays = (
        sum(track_play_counts) / len(track_play_counts) if track_play_counts else 0
    )

    # Binge listening (sessions with same artist)
    session_artists = []
    current_session_artist = None
    current_session_count = 0
    for t in tracks:
        a = t.get("master_metadata_album_artist_name")
        if a == current_session_artist:
            current_session_count += 1
        else:
            if current_session_count >= 5:
                session_artists.append((current_session_artist, current_session_count))
            current_session_artist = a
            current_session_count = 1

    # Build result
    top_artists = [
        (a, artist_plays[a], artist_ms[a] / 3600000)
        for a in artist_plays.most_common(20)
    ]
    top_albums = [
        (a, album_plays[a], album_ms[a] / 3600000) for a in album_plays.most_common(20)
    ]
    top_tracks = [
        (t, track_plays[t], track_ms[t] / 3600000) for t in track_plays.most_common(20)
    ]

    return {
        "name": name,
        "total_entries": len(entries),
        "total_plays": len(tracks),
        "total_hours": round(total_hours, 1),
        "total_days": round(total_days, 2),
        "unique_artists": len(artists),
        "unique_albums": len(albums),
        "unique_tracks": len(track_names),
        "first_play": str(first_play),
        "last_play": str(last_play),
        "days_tracked": days_tracked,
        "avg_plays_per_day": round(avg_plays_per_day, 1),
        "avg_hours_per_day": round(avg_hours_per_day, 1),
        "skip_rate": round(skip_rate, 1),
        "shuffle_rate": round(shuffle_rate, 1),
        "longest_streak": longest_streak,
        "avg_replays": round(avg_replays, 1),
        "top_artists": top_artists,
        "top_albums": top_albums,
        "top_tracks": top_tracks,
        "hours_of_day": dict(sorted(hours_of_day.items())),
        "days_of_week": dict(days_of_week),
        "months": dict(sorted(months.items())),
        "years": dict(sorted(years.items())),
        "platforms": dict(platforms.most_common(5)),
        "countries": dict(countries.most_common(5)),
    }


def compare(a, b):
    """Compare two analyses."""
    shared_artists = set(x[0] for x in a["top_artists"]) & set(
        x[0] for x in b["top_artists"]
    )
    shared_albums = set(x[0] for x in a["top_albums"]) & set(
        x[0] for x in b["top_albums"]
    )
    shared_tracks = set(x[0] for x in a["top_tracks"]) & set(
        x[0] for x in b["top_tracks"]
    )

    return {
        "shared_artists": shared_artists,
        "shared_albums": shared_albums,
        "shared_tracks": shared_tracks,
        "artist_overlap": len(shared_artists),
        "album_overlap": len(shared_albums),
        "track_overlap": len(shared_tracks),
    }


# Run analysis
paranjay = load_data("/tmp/riff_analysis/paranjay")
purvjeet = load_data("/tmp/riff_analysis/purvjeet")

p_analysis = analyze(paranjay, "Paranjay")
pu_analysis = analyze(purvjeet, "Purvjeet")
comp = compare(p_analysis, pu_analysis)

# Output as JSON
result = {
    "paranjay": p_analysis,
    "purvjeet": pu_analysis,
    "comparison": {
        "shared_artists": list(comp["shared_artists"]),
        "shared_albums": list(comp["shared_albums"]),
        "shared_tracks": list(comp["shared_tracks"]),
        "artist_overlap": comp["artist_overlap"],
        "album_overlap": comp["album_overlap"],
        "track_overlap": comp["track_overlap"],
    },
}

with open("/Users/paranjay/Developer/riff.fm/analysis.json", "w") as f:
    json.dump(result, f, indent=2, default=str)

print(
    f"Paranjay: {p_analysis['total_plays']} plays, {p_analysis['total_hours']}h, {p_analysis['unique_artists']} artists"
)
print(
    f"Purvjeet: {pu_analysis['total_plays']} plays, {pu_analysis['total_hours']}h, {pu_analysis['unique_artists']} artists"
)
print(
    f"Shared: {comp['artist_overlap']} artists, {comp['album_overlap']} albums, {comp['track_overlap']} tracks"
)
print("Done! Saved to analysis.json")
