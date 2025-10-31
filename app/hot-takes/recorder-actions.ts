"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { RecordingStatus } from "@prisma/client";
import { getOrCreateUserForClerkId } from "@/lib/user-from-clerk";

const DAILY_LIMIT = 5;

export async function checkRecordingQuota() {
  const { userId } = auth();
  if (!userId) {
    return { allowed: false, remaining: 0, limit: DAILY_LIMIT };
  }

  const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const usageCount = await prisma.recordingDraft.count({
    where: {
      user: { clerkId: userId },
      createdAt: { gte: windowStart },
    },
  });

  const remaining = Math.max(DAILY_LIMIT - usageCount, 0);
  return {
    allowed: remaining > 0,
    remaining,
    limit: DAILY_LIMIT,
  };
}

export async function saveRecordingDraft({
  duration,
  sizeBytes,
  mimeType,
  notes,
  status = RecordingStatus.DRAFT,
}: {
  duration: number;
  sizeBytes: number;
  mimeType?: string;
  notes?: string;
  status?: RecordingStatus;
}) {
  const { userId } = auth();
  if (!userId) {
    return { success: false, error: "Sign in to save recordings." };
  }

  if (!Number.isFinite(duration) || duration <= 0) {
    return { success: false, error: "Missing recording duration." };
  }

  const { allowed, remaining } = await checkRecordingQuota();
  if (!allowed) {
    return {
      success: false,
      error: "Daily recording limit reached. Come back tomorrow with more takes.",
    };
  }

  const user = await getOrCreateUserForClerkId(userId);

  await prisma.recordingDraft.create({
    data: {
      userId: user.id,
      duration,
      sizeBytes,
      mimeType,
      notes,
      status,
    },
  });

  return {
    success: true,
    remaining: remaining - 1,
  };
}
