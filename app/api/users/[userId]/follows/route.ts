import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'followers' or 'following'

    if (type === 'followers') {
      const followers = await prisma.follow.findMany({
        where: { followingId: params.userId },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              email: true,
              _count: {
                select: {
                  hotTakes: true,
                  followers: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json({
        followers: followers.map(f => f.follower),
      });
    } else if (type === 'following') {
      const following = await prisma.follow.findMany({
        where: { followerId: params.userId },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              email: true,
              _count: {
                select: {
                  hotTakes: true,
                  followers: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json({
        following: following.map(f => f.following),
      });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Get follows error:', error);
    return NextResponse.json({ error: 'Failed to get follows' }, { status: 500 });
  }
}

