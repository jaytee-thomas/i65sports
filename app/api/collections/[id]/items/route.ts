import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Add item to collection
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: collectionId } = params;
    const body = await request.json();
    const { takeId } = body;

    if (!takeId) {
      return NextResponse.json({ error: 'takeId required' }, { status: 400 });
    }

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check ownership
    const collection = await (prisma as any).collections.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    if (collection.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already exists
    const existing = await (prisma as any).collection_items.findUnique({
      where: {
        collectionId_takeId: {
          collectionId,
          takeId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Item already in collection' }, { status: 400 });
    }

    // Get current max order
    const maxOrder = await (prisma as any).collection_items.findFirst({
      where: { collectionId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const item = await (prisma as any).collection_items.create({
      data: {
        id: `ci_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        collectionId,
        takeId,
        order: (maxOrder?.order || 0) + 1,
      },
      include: {
        HotTake: {
          include: {
            User: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    // Update collection's updatedAt
    await (prisma as any).collections.update({
      where: { id: collectionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('[collection-item-post]:', error);
    return NextResponse.json({ 
      error: 'Failed to add item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Remove item from collection
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: collectionId } = params;
    const { searchParams } = new URL(request.url);
    const takeId = searchParams.get('takeId');

    if (!takeId) {
      return NextResponse.json({ error: 'takeId required' }, { status: 400 });
    }

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check ownership
    const collection = await (prisma as any).collections.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    if (collection.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await (prisma as any).collection_items.delete({
      where: {
        collectionId_takeId: {
          collectionId,
          takeId,
        },
      },
    });

    // Update collection's updatedAt
    await (prisma as any).collections.update({
      where: { id: collectionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message: 'Item removed' });
  } catch (error) {
    console.error('[collection-item-delete]:', error);
    return NextResponse.json({ 
      error: 'Failed to remove item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
