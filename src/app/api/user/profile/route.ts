import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // If no session, return public profile for username query
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (username) {
      // Public profile lookup
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
            select: { publicProfile: true },
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
          { success: false, error: "Profile is private" },
          { status: 403 },
        );
      }

      return NextResponse.json({ success: true, data: user });
    }

    // Authenticated: return own profile
    if (!session?.user?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.userId },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        email: true,
        createdAt: true,
        privacySettings: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: user,
        privacy: user.privacySettings || {
          publicProfile: true,
          showListening: true,
          showStats: true,
          showTopLists: true,
          showFriends: true,
          showHistory: false,
          showGenres: true,
          showHours: true,
        },
      },
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { name, username, bio, privacy } = body;

    // Update profile fields
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (username !== undefined) {
      // Check uniqueness
      if (username) {
        const existing = await db.user.findFirst({
          where: {
            username,
            id: { not: session.user.userId },
          },
        });
        if (existing) {
          return NextResponse.json(
            { success: false, error: "Username already taken" },
            { status: 400 },
          );
        }
      }
      updateData.username = username;
    }
    if (bio !== undefined) updateData.bio = bio;

    if (Object.keys(updateData).length > 0) {
      await db.user.update({
        where: { id: session.user.userId },
        data: updateData,
      });
    }

    // Update privacy settings
    if (privacy) {
      await db.privacySettings.upsert({
        where: { userId: session.user.userId },
        create: {
          userId: session.user.userId,
          ...privacy,
        },
        update: privacy,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
