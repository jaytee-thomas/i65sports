import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Get collection details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        items: {
          orderBy: {
            order: 'asc',
          },
          include: {
            hotTake: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                  },
                },
                _count: {
                  select: {
                    reactions: true,
                    comments: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
            followers: true,
          },
        },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Check if user can view (owner or public)
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!collection.isPublic && collection.userId !== dbUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('[collection-get]:', error);
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
  }
}

// Update collection
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, description, isPublic, coverImage } = body;

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    // Check ownership
    const existingCollection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!existingCollection || existingCollection.userId !== dbUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(isPublic !== undefined && { isPublic }),
        ...(coverImage !== undefined && { coverImage }),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            items: true,
            followers: true,
          },
        },
      },
    });

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('[collection-patch]:', error);
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

// Delete collection
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    // Check ownership
    const collection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!collection || collection.userId !== dbUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.collection.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Collection deleted' });
  } catch (error) {
    console.error('[collection-delete]:', error);
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}

