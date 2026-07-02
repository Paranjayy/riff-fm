import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard?error=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/spotify/callback`,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.redirect(
        new URL(
          `/dashboard?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`,
          request.url
        )
      );
    }

    // Get user profile from Spotify
    const profileResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profile = await profileResponse.json();

    // Find user by Spotify ID (we need session context here)
    // For now, redirect to dashboard — the NextAuth session handles the rest
    // The actual token storage happens in the NextAuth signIn callback
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Spotify callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=callback_failed", request.url));
  }
}
