"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ReplyKind, TakeKind } from "@prisma/client";
import { getOrCreateUserForClerkId } from "@/lib/user-from-clerk";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

function normalizeTags(tags: string[] | undefined) {
  if (!tags) return [];
  return tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => tag.replace(/^#/, "").toLowerCase());
}

export async function createHotTake({
  title,
  textBody,
  tags,
}: {
  title?: string;
  textBody: string;
  tags?: string[];
}): Promise<ActionResult> {
  const trimmedBody = textBody?.trim();

  const { userId } = auth();
  if (!userId) {
    return { success: false, error: "Sign in to publish your take." };
  }

  if (!trimmedBody) {
    return { success: false, error: "Add a few words — your take is empty." };
  }

  const author = await getOrCreateUserForClerkId(userId);

  const sanitizedTitle = title?.trim() || null;
  const tagList = normalizeTags(tags);

  await prisma.hotTake.create({
    data: {
      authorId: author.id,
      kind: TakeKind.TEXT,
      title: sanitizedTitle,
      textBody: trimmedBody,
      tags: tagList,
    },
  });

  revalidatePath("/hot-takes");
  return { success: true };
}

export async function createReply({
  takeId,
  textBody,
}: {
  takeId: string;
  textBody: string;
}): Promise<ActionResult> {
  const trimmedBody = textBody?.trim();

  const { userId } = auth();
  if (!userId) {
    return { success: false, error: "Sign in to join the conversation." };
  }

  if (!takeId) {
    return { success: false, error: "Missing hot take reference." };
  }
  if (!trimmedBody) {
    return { success: false, error: "Reply cannot be empty." };
  }

  const [author, take] = await Promise.all([
    getOrCreateUserForClerkId(userId),
    prisma.hotTake.findUnique({ where: { id: takeId }, select: { id: true } }),
  ]);

  if (!take) {
    return { success: false, error: "Hot take was removed. Refresh and try again." };
  }

  await prisma.reply.create({
    data: {
      takeId: take.id,
      authorId: author.id,
      kind: ReplyKind.TEXT,
      textBody: trimmedBody,
    },
  });

  revalidatePath("/hot-takes");
  return { success: true };
}
