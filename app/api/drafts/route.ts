import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Get all drafts for user
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
      return NextResponse.json({ drafts: [] });
    }

    const drafts = await prisma.draft.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error('[drafts-get]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}

// Create new draft
export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      videoUri,
      thumbnailUri,
      sport,
      venue,
      venueName,
      visibility,
      scheduledFor,
      editMetadata,
    } = body;

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username:
            clerkUser.username ||
            clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] ||
            'user',
        },
      });
    }

    const draft = await prisma.draft.create({
      data: {
        userId: dbUser.id,
        title,
        videoUri,
        thumbnailUri,
        sport,
        venue,
        venueName,
        visibility: visibility || 'PUBLIC',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        editMetadata,
      },
    });

    return NextResponse.json({ draft }, { status: 201 });
  } catch (error) {
    console.error('[drafts-post]:', error);
    return NextResponse.json(
      { error: 'Failed to create draft' },
      { status: 500 }
    );
  }
}

