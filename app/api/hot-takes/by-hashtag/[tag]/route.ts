import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { tag: string } }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tag = params.tag;

    const hotTakes = await prisma.hotTake.findMany({
      where: {
        status: 'PUBLISHED',
        tags: { has: tag },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ hotTakes });
  } catch (error) {
    console.error('Error fetching hot takes by hashtag:', error);
    return NextResponse.json({ error: 'Failed to fetch hot takes' }, { status: 500 });
  }
}

