"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ReplyKind, TakeKind } from "@prisma/client";

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

async function ensureAuthor(authorId: string) {
  if (!authorId) return null;
  return prisma.user.findUnique({ where: { id: authorId } });
}

export async function createHotTake({
  authorId,
  title,
  textBody,
  tags,
}: {
  authorId: string;
  title?: string;
  textBody: string;
  tags?: string[];
}): Promise<ActionResult> {
  const trimmedBody = textBody?.trim();
  if (!authorId) {
    return { success: false, error: "Choose an author for this take." };
  }
  if (!trimmedBody) {
    return { success: false, error: "Add a few words — your take is empty." };
  }

  const author = await ensureAuthor(authorId);
  if (!author) {
    return { success: false, error: "Selected author no longer exists." };
  }

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
  authorId,
  takeId,
  textBody,
}: {
  authorId: string;
  takeId: string;
  textBody: string;
}): Promise<ActionResult> {
  const trimmedBody = textBody?.trim();
  if (!authorId) {
    return { success: false, error: "Select who is replying." };
  }
  if (!takeId) {
    return { success: false, error: "Missing hot take reference." };
  }
  if (!trimmedBody) {
    return { success: false, error: "Reply cannot be empty." };
  }

  const [author, take] = await Promise.all([
    ensureAuthor(authorId),
    prisma.hotTake.findUnique({ where: { id: takeId }, select: { id: true } }),
  ]);

  if (!author) {
    return { success: false, error: "Selected author no longer exists." };
  }
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
