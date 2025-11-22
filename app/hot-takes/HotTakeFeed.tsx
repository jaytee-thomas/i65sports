import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import ReplyForm from "./ReplyForm";

function formatRelative(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default async function HotTakeFeed() {
  type HotTakeWithRelations = Prisma.HotTakeGetPayload<{
    include: {
      author: { select: { username: true; role: true } };
      reactions: true;
      comments: {
        include: {
          author: { select: { username: true } };
        };
      };
    };
  }>;

  let hotTakes: HotTakeWithRelations[] | null = null;

  try {
    hotTakes = await prisma.hotTake.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { username: true, role: true } },
        reactions: true,
        comments: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            author: { select: { username: true } },
          },
        },
      },
      take: 10,
    });
  } catch (error) {
    console.error("[hot-take-feed] Failed to load hot takes", error);
    return (
      <div className="rounded-3xl border border-yellow-900/60 bg-yellow-950/20 p-6 text-sm text-yellow-200">
        Hot take feed is temporarily unavailable. Check your database connection and try again.
      </div>
    );
  }

  const list = hotTakes ?? [];

  if (list.length === 0) {
    return (
      <div className="rounded-3xl border border-ash/60 bg-graphite/60 p-8 text-center text-sm text-neutral-400">
        No hot takes yet — be the first voice on the board tonight.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {list.map((take) => (
        <article
          key={take.id}
          className="group overflow-hidden rounded-3xl border border-ash/60 bg-gradient-to-br from-graphite via-iron to-midnight transition hover:border-neon-emerald/60 hover:shadow-glow-blue"
        >
          <div className="flex items-center justify-between border-b border-ash/60 px-6 py-4 text-xs uppercase tracking-[0.24em] text-neutral-500">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-neon-emerald/60" />
              @{take.author.username}
            </span>
            <span>{take.author.role.toLowerCase()} · {formatRelative(take.createdAt)}</span>
          </div>
          <div className="space-y-4 px-6 py-6">
            {take.title && (
              <h3 className="font-display text-2xl font-semibold text-white">
                {take.title}
              </h3>
            )}
            {take.textBody && (
              <p className="text-sm leading-7 text-neutral-200">
                {take.textBody}
              </p>
            )}
            {take.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.28em] text-neutral-500">
                {take.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-ash/60 bg-graphite/70 px-3 py-1 text-neutral-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <footer className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
              <span className="font-medium text-neutral-200">
                Comments · <span className="font-numeric text-sm text-neon-emerald">{take.comments.length}</span>
              </span>
              <span className="font-medium text-neutral-200">
                Reactions · <span className="font-numeric text-sm text-neutral-100">{take.reactions.length}</span>
              </span>
            </footer>
            <div className="overflow-hidden rounded-2xl border border-ash/60 bg-graphite/70">
              <div className="flex items-center justify-between border-b border-ash/60 px-4 py-2 text-xs uppercase tracking-[0.24em] text-neutral-500">
                <span>Comments</span>
                <span className="hidden md:inline-block text-neutral-400">Drop a respectful counterpoint</span>
              </div>
              <ul className="divide-y divide-ash/50">
                {take.comments.length === 0 ? (
                  <li className="px-4 py-4 text-sm text-neutral-500">
                    No comments yet. Spark the conversation.
                  </li>
                ) : (
                  take.comments.map((comment) => (
                    <li key={comment.id} className="px-4 py-4 transition hover:bg-iron/60">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-neon-blue/60" />
                        @{comment.author.username} · {formatRelative(comment.createdAt)}
                      </div>
                      <p className="mt-2 text-sm text-neutral-200">
                        {comment.body}
                      </p>
                    </li>
                  ))
                )}
              </ul>
              <ReplyForm takeId={take.id} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
