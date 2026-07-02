import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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

    // Get accepted friends
    const friendships = await db.friend.findMany({
      where: {
        OR: [
          { senderId: userId, status: "ACCEPTED" },
          { receiverId: userId, status: "ACCEPTED" },
        ],
      },
      include: {
        sender: {
          select: { id: true, name: true, username: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });

    const friends = friendships.map((f) =>
      f.senderId === userId ? f.receiver : f.sender,
    );

    // Pending sent
    const sentPending = await db.friend.findMany({
      where: { senderId: userId, status: "PENDING" },
      include: {
        receiver: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });

    // Pending received
    const receivedPending = await db.friend.findMany({
      where: { receiverId: userId, status: "PENDING" },
      include: {
        sender: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        friends,
        pendingSent: sentPending.map((f) => f.receiver),
        pendingReceived: receivedPending.map((f) => f.sender),
      },
    });
  } catch (error) {
    console.error("Friends GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { receiverId } = body;

    if (!receiverId) {
      return NextResponse.json(
        { success: false, error: "receiverId is required" },
        { status: 400 },
      );
    }

    if (receiverId === session.user.userId) {
      return NextResponse.json(
        { success: false, error: "Cannot add yourself as a friend" },
        { status: 400 },
      );
    }

    // Check if relationship already exists
    const existing = await db.friend.findFirst({
      where: {
        OR: [
          { senderId: session.user.userId, receiverId },
          { senderId: receiverId, receiverId: session.user.userId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Friend request already exists" },
        { status: 400 },
      );
    }

    await db.friend.create({
      data: {
        senderId: session.user.userId,
        receiverId,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Friends POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { friendId, action } = body;

    if (!friendId || !action) {
      return NextResponse.json(
        { success: false, error: "friendId and action are required" },
        { status: 400 },
      );
    }

    const friendship = await db.friend.findFirst({
      where: {
        OR: [
          { senderId: session.user.userId, receiverId: friendId },
          { senderId: friendId, receiverId: session.user.userId },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { success: false, error: "Friend request not found" },
        { status: 404 },
      );
    }

    if (action === "accept") {
      await db.friend.update({
        where: { id: friendship.id },
        data: { status: "ACCEPTED" },
      });
    } else if (action === "reject") {
      await db.friend.delete({
        where: { id: friendship.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Friends PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json(
        { success: false, error: "friendId is required" },
        { status: 400 },
      );
    }

    await db.friend.deleteMany({
      where: {
        OR: [
          { senderId: session.user.userId, receiverId: friendId },
          { senderId: friendId, receiverId: session.user.userId },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Friends DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
