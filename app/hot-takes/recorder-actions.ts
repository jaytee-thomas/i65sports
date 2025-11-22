"use server";

import { auth } from "@clerk/nextjs/server";

const DAILY_LIMIT = 5;

export async function checkRecordingQuota() {
  const { userId } = auth();
  if (!userId) {
    return { allowed: false, remaining: 0, limit: DAILY_LIMIT };
  }
  
  // TODO: Implement quota check using HotTake table
  // For now, allow unlimited recordings
  return {
    allowed: true,
    remaining: DAILY_LIMIT,
    limit: DAILY_LIMIT,
  };
}

export async function saveRecordingDraft({
  duration,
  sizeBytes,
  mimeType,
}: {
  duration: number;
  sizeBytes: number;
  mimeType?: string;
}) {
  const { userId } = auth();
  if (!userId) {
    return { success: false, error: "Sign in to save recordings." };
  }
  
  // Just return success - actual save happens in upload API
  return {
    success: true,
    remaining: DAILY_LIMIT - 1,
  };
}
