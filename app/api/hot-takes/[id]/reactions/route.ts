import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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
    const { type } = body;

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

    // Map type to emoji (schema uses emoji field)
    const emoji = type === 'LIKE' ? '❤️' : type || '❤️';

    // Check if reaction already exists (schema has unique on [takeId, userId, emoji])
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        takeId: id,
        userId: dbUser.id,
        emoji: emoji,
      },
    });

    if (existingReaction) {
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });
      return NextResponse.json({ reacted: false, message: 'Reaction removed' });
    }

    const reaction = await prisma.reaction.create({
      data: {
        emoji: emoji,
        userId: dbUser.id,
        takeId: id,
      },
    });

    return NextResponse.json({ reacted: true, reaction }, { status: 201 });
  } catch (error) {
    console.error('[reactions-post]:', error);
    return NextResponse.json({ error: 'Failed to create reaction' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const clerkUser = await currentUser();
    
    const reactions = await prisma.reaction.findMany({
      where: { takeId: id },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      } as any,
    });

    // Check if current user has reacted
    let hasReacted = false;
    if (clerkUser) {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
      });
      if (dbUser) {
        hasReacted = reactions.some((r: any) => r.userId === dbUser.id);
      }
    }

    return NextResponse.json({ 
      reactions,
      hasReacted,
      reactionCount: reactions.length,
    });
  } catch (error) {
    console.error('[reactions-get]:', error);
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
  }
}
