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

    const { id } = params;
    const body = await request.json();
    const { takeId } = body;

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

    // Check if already exists
    const existing = await prisma.collectionItem.findUnique({
      where: {
        collectionId_takeId: {
          collectionId: id,
          takeId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Item already in collection' }, { status: 400 });
    }

    // Get current max order
    const maxOrder = await prisma.collectionItem.findFirst({
      where: { collectionId: id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const item = await prisma.collectionItem.create({
      data: {
        collectionId: id,
        takeId,
        order: (maxOrder?.order || 0) + 1,
      },
      include: {
        hotTake: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('[collection-item-post]:', error);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
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

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const takeId = searchParams.get('takeId');

    if (!takeId) {
      return NextResponse.json({ error: 'takeId required' }, { status: 400 });
    }

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

    await prisma.collectionItem.delete({
      where: {
        collectionId_takeId: {
          collectionId: id,
          takeId,
        },
      },
    });

    return NextResponse.json({ message: 'Item removed' });
  } catch (error) {
    console.error('[collection-item-delete]:', error);
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
  }
}

