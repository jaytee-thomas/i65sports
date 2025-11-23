import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId"); // Optional: filter by user
    const limit = parseInt(searchParams.get("limit") || "20");
    const cursor = searchParams.get("cursor"); // For pagination

    const where = userId
      ? {
          author: {
            clerkId: userId,
          },
        }
      : {};

    const hotTakes = await prisma.hotTake.findMany({
      where,
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: {
          id: cursor,
        },
      }),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
    });

    const nextCursor =
      hotTakes.length === limit ? hotTakes[hotTakes.length - 1].id : null;

    return NextResponse.json({
      hotTakes,
      nextCursor,
    });
  } catch (error) {
    console.error("[hot-takes-get] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch hot takes" },
      { status: 500 }
    );
  }
}

