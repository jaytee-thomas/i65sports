"use client";

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { useState, useTransition } from "react";
import { useToast } from "../components/ToastProvider";
import { createReply } from "./actions";

type OptimisticReply = {
  id: string;
  textBody: string;
  author: string;
  status: "pending" | "error";
};

const createId = () => (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
  ? crypto.randomUUID()
  : Math.random().toString(36).slice(2));

export default function ReplyForm({ takeId }: { takeId: string }) {
  const { user } = useUser();
  const { pushToast } = useToast();
  const [textBody, setTextBody] = useState("");
  const [optimisticReplies, setOptimisticReplies] = useState<OptimisticReply[]>([]);
  const [isPending, startTransition] = useTransition();

  const displayName =
    user?.username ||
    user?.firstName?.concat(user.lastName ? ` ${user.lastName}` : "") ||
    user?.primaryEmailAddress?.emailAddress ||
    "you";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const optimisticId = createId();
    const trimmedBody = textBody.trim();
    if (!trimmedBody) return;

    setOptimisticReplies((prev) => [
      ...prev,
      { id: optimisticId, textBody: trimmedBody, author: displayName, status: "pending" },
    ]);

    startTransition(async () => {
      const result = await createReply({
        takeId,
        textBody: trimmedBody,
      });

      if (result.success) {
        pushToast({
          title: "Reply posted",
          description: "Your reply just hit the thread.",
          variant: "success",
        });
        setTextBody("");
        setOptimisticReplies((prev) => prev.filter((reply) => reply.id !== optimisticId));
      } else {
        setOptimisticReplies((prev) =>
          prev.map((reply) => (reply.id === optimisticId ? { ...reply, status: "error" } : reply)),
        );
        pushToast({
          title: "Reply failed",
          description: result.error,
          variant: "error",
        });
      }
    });
  };

  return (
    <div className="space-y-3 border-t border-ash/60 bg-graphite/80 px-4 py-4">
      <SignedOut>
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">Sign in to join the thread.</span>
          <SignInButton mode="modal">
            <button className="rounded-full border border-neon-emerald/60 bg-graphite/80 px-4 py-1.5 text-[11px] uppercase tracking-[0.32em] text-neon-emerald transition hover:-translate-y-0.5 hover:text-white">
              Sign in
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <form onSubmit={handleSubmit} className="space-y-3">
          {optimisticReplies.length > 0 && (
            <div className="space-y-2 rounded-2xl border border-ash/60 bg-graphite/70 p-3">
              <div className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">Pending replies</div>
              <ul className="space-y-2 text-sm text-neutral-200">
                {optimisticReplies.map((reply) => (
                  <li
                    key={reply.id}
                    className={`rounded-xl border px-3 py-2 ${
                      reply.status === "error"
                        ? "border-red-700/60 bg-red-900/30 text-red-200"
                        : "border-neon-emerald/40 bg-neon-emerald/5"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                      <span>@{reply.author}</span>
                      <span>{reply.status === "error" ? "Failed" : "Posting…"}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6">{reply.textBody}</p>
                    {reply.status === "error" ? (
                      <button
                        type="button"
                        onClick={() =>
                          setOptimisticReplies((prev) => prev.filter((candidate) => candidate.id !== reply.id))
                        }
                        className="mt-2 text-xs uppercase tracking-[0.3em] text-red-200 underline-offset-4 hover:underline"
                      >
                        Dismiss
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <textarea
            className="h-24 w-full resize-none rounded-2xl border border-ash/60 bg-iron/80 px-4 py-3 text-sm leading-6 text-neutral-100 transition focus:border-neon-emerald focus:outline-none"
            placeholder="Keep it respectful. Fire back with your POV."
            value={textBody}
            onChange={(event) => setTextBody(event.target.value)}
            maxLength={360}
          />

          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>
              Replying as <span className="text-neutral-200">{displayName}</span>
            </span>
            <button
              type="submit"
              className="rounded-full border border-ash/60 bg-iron/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-300 transition hover:border-neon-blue/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending || textBody.trim().length === 0}
            >
              {isPending ? "Posting…" : "Reply"}
            </button>
          </div>
        </form>
      </SignedIn>
    </div>
  );
}
