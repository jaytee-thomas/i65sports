import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Get all collections (user's own + public ones they follow)
export async function GET(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // Optional: get specific user's collections

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] || 'user',
        },
      });
    }

    const collections = await (prisma as any).collections.findMany({
      where: userId
        ? { userId } // Get specific user's public collections
        : {
            OR: [
              { userId: dbUser.id }, // User's own collections
              {
                isPublic: true,
                collection_followers: {
                  some: {
                    userId: dbUser.id,
                  },
                },
              }, // Public collections they follow
            ],
          },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            collection_items: true,
            collection_followers: true,
          } as any,
        },
        collection_items: {
          take: 3,
          orderBy: {
            order: 'asc',
          },
          include: {
            HotTake: {
              select: {
                id: true,
                thumbUrl: true,
                videoUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ collections });
  } catch (error) {
    console.error('[collections-get]:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

// Create new collection
export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, isPublic, coverImage } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Collection name required' }, { status: 400 });
    }

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] || 'user',
        },
      });
    }

    const collection = await (prisma as any).collections.create({
      data: {
        id: `coll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        description: description?.trim(),
        isPublic: isPublic || false,
        coverImage,
        userId: dbUser.id,
        updatedAt: new Date(),
      },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            collection_items: true,
            collection_followers: true,
          } as any,
        },
      },
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error('[collections-post]:', error);
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}

