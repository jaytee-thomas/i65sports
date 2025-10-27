"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

async function ensureUniqueUsername(base: string) {
  let candidate = base || `fan-${Math.random().toString(36).slice(2, 8)}`;
  let suffix = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.user.findUnique({ where: { username: candidate } });
    if (!existing) return candidate;
    candidate = `${base}-${suffix++}`.slice(0, 32);
  }
}

export async function getOrCreateUserForClerkId(clerkId: string) {
  const existing = await prisma.user.findUnique({
    where: { clerkId },
  });
  if (existing) return existing;

  const clerkUser = await clerkClient.users.getUser(clerkId);

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    `${clerkId}@placeholder.local`;

  const baseUsername =
    clerkUser.username ||
    slugify(
      [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join("-") || email.split("@")[0] || "fan"
    );

  const username = await ensureUniqueUsername(baseUsername);

  return prisma.user.create({
    data: {
      email,
      username,
      clerkId,
    },
  });
}
