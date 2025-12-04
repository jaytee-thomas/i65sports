import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (query.trim().length === 0) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
        NOT: {
          clerkId: clerkUser.id, // Exclude current user
        },
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
      },
      take: 20,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('[users-search]:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
