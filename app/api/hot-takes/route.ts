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
    const limit = parseInt(searchParams.get('limit') || '20');
    const cursor = searchParams.get('cursor');
    const sport = searchParams.get('sport');

    // Find or create user
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      // Auto-create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] || 'user',
        },
      });
      console.log('✅ Created new user:', dbUser.id);
    }

    const whereClause: any = {
      status: 'PUBLISHED',
    };

    // ADD SPORT FILTER
    if (sport && sport !== 'all') {
      whereClause.sport = sport;
    }

    if (cursor) {
      whereClause.id = {
        lt: cursor,
      };
    }

    const hotTakes = await prisma.hotTake.findMany({
      where: whereClause,
      include: {
        User: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            Reaction: true,
            Comment: true,
          },
        },
      } as any,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Map User to author and _count fields for backward compatibility
    const formattedHotTakes = hotTakes.map((take: any) => ({
      ...take,
      author: take.User,
      _count: {
        reactions: take._count?.Reaction || 0,
        comments: take._count?.Comment || 0,
      },
    }));

    const nextCursor = hotTakes.length === limit ? hotTakes[hotTakes.length - 1].id : null;

    return NextResponse.json({
      hotTakes: formattedHotTakes,
      nextCursor,
    });
  } catch (error) {
    console.error('[hot-takes-get] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hot takes' },
      { status: 500 }
    );
  }
}
