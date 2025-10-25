import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import ReplyForm from "./ReplyForm";
import type { AuthorOption } from "./types";

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

export default async function HotTakeFeed({
  replyAuthors,
}: {
  replyAuthors: AuthorOption[];
}) {
  type HotTakeWithRelations = Prisma.HotTakeGetPayload<{
    include: {
      author: { select: { username: true; role: true } };
      replies: {
        include: {
          author: { select: { username: true } };
        };
      };
      reactions: true;
      comments: true;
    };
  }>;

  let hotTakes: HotTakeWithRelations[] | null = null;

  try {
    hotTakes = await prisma.hotTake.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { username: true, role: true } },
        replies: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            author: { select: { username: true } },
          },
        },
        reactions: true,
        comments: true,
      },
      take: 10,
    });
  } catch (error) {
    console.error("[hot-take-feed] Failed to load hot takes", error);
    return (
      <div className="rounded-xl border border-yellow-900/60 bg-yellow-950/30 p-6 text-sm text-yellow-200">
        Hot take feed is temporarily unavailable. Check your database connection and try again.
      </div>
    );
  }

  const list = hotTakes ?? [];

  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-800 p-6 text-sm text-neutral-400">
        No hot takes yet — be the first to record one.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((take) => (
        <article
          key={take.id}
          className="rounded-xl border border-neutral-800 bg-neutral-950/60"
        >
          <div className="border-b border-neutral-800 px-4 py-3 text-xs text-neutral-400">
            <span className="font-medium text-neutral-200">
              {take.author.username}
            </span>{" "}
            · {take.author.role.toLowerCase()} · {formatRelative(take.createdAt)}
          </div>
          <div className="space-y-3 px-4 py-4">
            {take.title && (
              <h3 className="text-lg font-semibold text-neutral-50">
                {take.title}
              </h3>
            )}
            {take.textBody && (
              <p className="text-sm leading-6 text-neutral-200">
                {take.textBody}
              </p>
            )}
            {take.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
                {take.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-neutral-800 px-2 py-0.5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <footer className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
              <span>Replies · {take.replies.length}</span>
              <span>Reactions · {take.reactions.length}</span>
              <span>Comments · {take.comments.length}</span>
            </footer>
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/50">
              <div className="border-b border-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-400">
                Replies
              </div>
              <ul className="divide-y divide-neutral-800">
                {take.replies.length === 0 ? (
                  <li className="px-3 py-3 text-sm text-neutral-500">
                    No replies yet. Be the first.
                  </li>
                ) : (
                  take.replies.map((reply) => (
                    <li key={reply.id} className="px-3 py-3">
                      <div className="text-xs text-neutral-400">
                        {reply.author.username} ·{" "}
                        {formatRelative(reply.createdAt)}
                      </div>
                      {reply.textBody ? (
                        <p className="mt-1 text-sm leading-6 text-neutral-200">
                          {reply.textBody}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm italic text-neutral-500">
                          {reply.kind.toLowerCase()} reply — tap to play
                        </p>
                      )}
                    </li>
                  ))
                )}
              </ul>
              <ReplyForm takeId={take.id} authors={replyAuthors} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
