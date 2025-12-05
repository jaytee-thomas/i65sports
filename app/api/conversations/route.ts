import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Get all conversations for current user
export async function GET(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const conversations = await (prisma as any).conversations.findMany({
      where: {
        conversation_participants: {
          some: {
            userId: dbUser.id,
          },
        },
      },
      include: {
        conversation_participants: {
          include: {
            User: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            User: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          } as any,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('[conversations-get]:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// Create new conversation
export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { participantIds, type, name, imageUrl } = body;

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

    // For direct messages, check if conversation already exists
    if (type === 'DIRECT' && participantIds.length === 1) {
      const existingConversation = await (prisma as any).conversations.findFirst({
        where: {
          type: 'DIRECT',
          AND: [
            {
              conversation_participants: {
                some: {
                  userId: dbUser.id,
                },
              },
            },
            {
              conversation_participants: {
                some: {
                  userId: participantIds[0],
                },
              },
            },
          ],
        },
        include: {
          conversation_participants: {
            include: {
              User: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      if (existingConversation) {
        return NextResponse.json({ conversation: existingConversation });
      }
    }

    // Create new conversation
    const conversation = await (prisma as any).conversations.create({
      data: {
        type: type || 'DIRECT',
        name,
        imageUrl,
        updatedAt: new Date(),
        conversation_participants: {
          create: [
            { 
              id: `cp_${Date.now()}_${dbUser.id}`,
              userId: dbUser.id 
            },
            ...participantIds.map((id: string, index: number) => ({ 
              id: `cp_${Date.now()}_${index}_${id}`,
              userId: id 
            })),
          ],
        },
      },
      include: {
        conversation_participants: {
          include: {
            User: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error('[conversations-post]:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
