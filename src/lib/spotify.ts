import { db } from "./db";
import type {
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyTrack,
  SpotifyTopItems,
  SpotifyProfile,
} from "@/types";

// ─── Constants ────────────────────────────────────────────────────

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

// ─── Spotify Client ───────────────────────────────────────────────

class SpotifyClient {
  /**
   * Retrieve a valid access token for the given user.
   * Refreshes automatically when the stored token is expired.
   */
  async getAccessToken(userId: string): Promise<string> {
    const account = await db.account.findFirst({
      where: { userId, provider: "spotify" },
      select: {
        id: true,
        access_token: true,
        refresh_token: true,
        expires_at: true,
      },
    });

    if (!account) {
      throw new Error("No Spotify account linked to this user.");
    }

    // Check whether the token is still valid (with a 60-second buffer)
    const now = Math.floor(Date.now() / 1000);
    if (account.access_token && account.expires_at && account.expires_at > now + 60) {
      return account.access_token;
    }

    // Need to refresh
    if (!account.refresh_token) {
      throw new Error("No refresh token available. Please re-authenticate with Spotify.");
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Spotify client credentials are not configured.");
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: account.refresh_token,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Spotify token refresh failed:", response.status, body);
      throw new Error(`Failed to refresh Spotify token (${response.status}).`);
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
      refresh_token?: string;
      token_type: string;
      scope: string;
    };

    // Persist the new tokens
    await db.account.update({
      where: { id: account.id },
      data: {
        access_token: data.access_token,
        expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
        ...(data.refresh_token && { refresh_token: data.refresh_token }),
      },
    });

    return data.access_token;
  }

  // ─── Internal helpers ──────────────────────────────────────────

  private async request<T>(token: string, path: string): Promise<T> {
    const response = await fetch(`${SPOTIFY_API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`Spotify API ${path} failed:`, response.status, body);
      throw new Error(`Spotify API error ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  // ─── Public API methods ────────────────────────────────────────

  /** Fetch the user's top artists for a given time range. */
  fetchTopArtists(
    token: string,
    timeRange: string,
    limit: number,
  ): Promise<SpotifyTopItems<SpotifyArtist>> {
    return this.request(
      token,
      `/me/top/artists?time_range=${encodeURIComponent(timeRange)}&limit=${limit}`,
    );
  }

  /** Fetch the user's top tracks for a given time range. */
  fetchTopTracks(
    token: string,
    timeRange: string,
    limit: number,
  ): Promise<SpotifyTopItems<SpotifyTrack>> {
    return this.request(
      token,
      `/me/top/tracks?time_range=${encodeURIComponent(timeRange)}&limit=${limit}`,
    );
  }

  /**
   * Fetch top albums by extracting unique albums from the user's top tracks.
   * Spotify has no dedicated "top albums" endpoint.
   */
  async fetchTopAlbums(
    token: string,
    timeRange: string,
    limit: number,
  ): Promise<SpotifyTopItems<SpotifyAlbum>> {
    const topTracks = await this.fetchTopTracks(token, timeRange, limit);

    const seen = new Set<string>();
    const albums: SpotifyAlbum[] = [];

    for (const track of topTracks.items) {
      if (track.album && !seen.has(track.album.id)) {
        seen.add(track.album.id);
        albums.push(track.album);
      }
    }

    return {
      items: albums,
      total: albums.length,
      limit: albums.length,
      offset: 0,
      next: null,
      previous: null,
    };
  }

  /** Fetch the user's recently played tracks. */
  fetchRecentlyPlayed(
    token: string,
    limit: number,
  ): Promise<{ items: { track: SpotifyTrack; played_at: string }[] }> {
    return this.request(token, `/me/player/recently-played?limit=${limit}`);
  }

  /** Fetch the authenticated user's Spotify profile. */
  fetchUserProfile(token: string): Promise<SpotifyProfile> {
    return this.request(token, "/me");
  }
}

// ─── Singleton export ─────────────────────────────────────────────

export const spotify = new SpotifyClient();
