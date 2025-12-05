import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: takeId } = params;

    const comments = await prisma.comment.findMany({
      where: {
        takeId,
      },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      } as any,
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    // Map User to author for backward compatibility
    const formattedComments = comments.map((comment: any) => ({
      ...comment,
      author: comment.User,
    }));

    return NextResponse.json({
      comments: formattedComments,
    });
  } catch (error) {
    console.error('[comments-get]:', error);
    return NextResponse.json(
      { error: 'Failed to load comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: takeId } = params;
    const body = await request.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    // Find user
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        body: text.trim(),
        takeId,
        authorId: dbUser.id,
      },
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

    // Map User to author for backward compatibility
    const formattedComment = {
      ...comment,
      author: (comment as any).User,
    };

    return NextResponse.json({
      comment: formattedComment,
    });
  } catch (error) {
    console.error('[comments-post]:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
