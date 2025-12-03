import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Map to emoji (schema uses emoji field)
    const emoji = '❤️';

    // Check if reaction already exists (schema has unique on [takeId, userId, emoji])
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        takeId: id,
        userId: userId,
        emoji: emoji,
      },
    });

    if (existingReaction) {
      await prisma.reaction.delete({ where: { id: existingReaction.id } });
      return NextResponse.json({ message: 'Like removed' });
    }

    const reaction = await prisma.reaction.create({
      data: {
        emoji: emoji,
        userId: userId,
        takeId: id,
      },
    });

    return NextResponse.json({ reaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to like' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Count all like reactions (emoji = '❤️')
    const likeCount = await prisma.reaction.count({
      where: {
        takeId: id,
        emoji: '❤️',
      },
    });

    // Check if user has liked (if userId provided)
    let isLiked = false;
    if (userId) {
      const userReaction = await prisma.reaction.findFirst({
        where: {
          takeId: id,
          userId: userId,
          emoji: '❤️',
        },
      });
      isLiked = !!userReaction;
    }

    return NextResponse.json({ likeCount, isLiked });
  } catch (error) {
    console.error('[like-get]:', error);
    return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
  }
}
