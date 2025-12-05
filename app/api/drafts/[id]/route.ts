import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Get single draft
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

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const draft = await (prisma as any).drafts.findUnique({
      where: { id },
    });

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    // Check ownership
    if (draft.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('[draft-get]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}

// Update draft
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

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    // Check ownership
    const existingDraft = await (prisma as any).drafts.findUnique({
      where: { id },
    });

    if (!existingDraft || existingDraft.userId !== dbUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const draft = await (prisma as any).drafts.update({
      where: { id },
      data: {
        ...body,
        ...(body.scheduledFor && { scheduledFor: new Date(body.scheduledFor) }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('[draft-patch]:', error);
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    );
  }
}

// Delete draft
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
    const draft = await (prisma as any).drafts.findUnique({
      where: { id },
    });

    if (!draft || draft.userId !== dbUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await (prisma as any).drafts.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Draft deleted' });
  } catch (error) {
    console.error('[draft-delete]:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}
