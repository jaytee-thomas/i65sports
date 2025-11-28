import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the hot take
    const hotTake = await prisma.hotTake.findUnique({
      where: { id: params.id },
    });

    if (!hotTake) {
      return NextResponse.json({ error: 'Hot Take not found' }, { status: 404 });
    }

    // Check if user owns this hot take
    if (hotTake.authorId !== dbUser.id) {
      return NextResponse.json({ error: 'Not authorized to delete this Hot Take' }, { status: 403 });
    }

    // Delete from R2 (optional - you might want to keep the files)
    try {
      if (hotTake.videoUrl) {
        const videoKey = hotTake.videoUrl.split('/').pop();
        if (videoKey) {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: `hot-takes/${videoKey}`,
          }));
        }
      }

      if (hotTake.thumbUrl) {
        const thumbKey = hotTake.thumbUrl.split('/').pop();
        if (thumbKey) {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: `thumbnails/${thumbKey}`,
          }));
        }
      }
    } catch (error) {
      console.error('Error deleting files from R2:', error);
      // Continue even if file deletion fails
    }

    // Delete from database (cascade will delete reactions and comments)
    await prisma.hotTake.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hot take:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

