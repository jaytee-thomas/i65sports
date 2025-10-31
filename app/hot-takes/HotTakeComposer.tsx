"use client";

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { useState, useTransition } from "react";
import { useToast } from "../components/ToastProvider";
import { createHotTake } from "./actions";

type OptimisticTake = {
  id: string;
  title?: string;
  textBody: string;
  tags: string[];
  status: "pending" | "error";
};

const createId = () => (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
  ? crypto.randomUUID()
  : Math.random().toString(36).slice(2));

export default function HotTakeComposer() {
  const { user } = useUser();
  const { pushToast } = useToast();
  const [title, setTitle] = useState("");
  const [textBody, setTextBody] = useState("");
  const [tags, setTags] = useState("");
  const [optimisticTakes, setOptimisticTakes] = useState<OptimisticTake[]>([]);
  const [isPending, startTransition] = useTransition();

  const displayName =
    user?.username ||
    user?.firstName?.concat(user.lastName ? ` ${user.lastName}` : "") ||
    user?.primaryEmailAddress?.emailAddress ||
    "You";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const optimisticId = createId();
    setOptimisticTakes((prev) => [
      ...prev,
      {
        id: optimisticId,
        title: title.trim() ? title : undefined,
        textBody,
        tags: tagList,
        status: "pending",
      },
    ]);

    startTransition(async () => {
      const result = await createHotTake({
        title,
        textBody,
        tags: tagList,
      });

      if (result.success) {
        pushToast({
          title: "Hot take published",
          description: "Your take is live. The feed will refresh shortly.",
          variant: "success",
        });
        setTitle("");
        setTextBody("");
        setTags("");
        setOptimisticTakes((prev) => prev.filter((take) => take.id !== optimisticId));
      } else {
        setOptimisticTakes((prev) =>
          prev.map((take) => (take.id === optimisticId ? { ...take, status: "error" } : take)),
        );
        pushToast({
          title: "Could not publish take",
          description: result.error,
          variant: "error",
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <SignedOut>
        <div className="rounded-2xl border border-ash/60 bg-graphite/60 p-4 text-center text-sm text-neutral-400">
          Sign in to publish your boldest calls.
        </div>
        <SignInButton mode="modal">
          <button className="w-full rounded-full border border-neon-emerald/60 bg-graphite/80 px-5 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-neon-emerald transition hover:-translate-y-0.5 hover:text-white">
            Sign in to post
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-ash/60 bg-graphite/70 px-4 py-3 text-xs uppercase tracking-[0.32em] text-neutral-400">
            Posting as <span className="ml-2 text-neutral-100">{displayName}</span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-500">
              Title (optional)
            </label>
            <input
              className="w-full rounded-2xl border border-ash/60 bg-graphite/80 px-4 py-3 text-sm text-neutral-100 transition focus:border-neon-emerald focus:outline-none"
              placeholder="Example: Colts are winning the AFC"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-500">
              Your take
            </label>
            <div className="rounded-2xl border border-ash/60 bg-graphite/80 p-1">
              <textarea
                className="h-32 w-full resize-none rounded-[18px] border border-transparent bg-transparent px-4 py-3 text-sm leading-7 text-neutral-100 transition focus:border-neon-emerald focus:outline-none"
                placeholder="You’ve got 60 seconds — drop the boldest statement in sports tonight."
                value={textBody}
                onChange={(event) => setTextBody(event.target.value)}
                maxLength={500}
              />
              <div className="flex justify-end px-2 pb-1 text-[10px] uppercase tracking-[0.32em] text-neutral-600">
                {textBody.length}/500
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.32em] text-neutral-500">
              Tags (comma separated)
            </label>
            <input
              className="w-full rounded-2xl border border-ash/60 bg-graphite/80 px-4 py-3 text-sm text-neutral-100 transition focus:border-neon-emerald focus:outline-none"
              placeholder="colts, upset, primetime"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full border border-neon-emerald/60 bg-gradient-to-r from-graphite via-iron to-graphite px-5 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-neon-emerald transition hover:-translate-y-0.5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
          >
            {isPending ? "Publishing…" : "Publish Hot Take"}
          </button>

          {optimisticTakes.length > 0 && (
            <div className="space-y-3 rounded-2xl border border-ash/60 bg-graphite/70 p-4">
              <div className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">Pending posts</div>
              <ul className="space-y-3 text-sm text-neutral-200">
                {optimisticTakes.map((take) => (
                  <li
                    key={take.id}
                    className={`rounded-xl border px-3 py-3 ${
                      take.status === "error"
                        ? "border-red-700/60 bg-red-900/30 text-red-200"
                        : "border-neon-emerald/40 bg-neon-emerald/5"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-neutral-500">
                      <span>{take.status === "error" ? "Failed to publish" : "Publishing…"}</span>
                      {take.tags.length ? <span>#{take.tags.join(" · #")}</span> : null}
                    </div>
                    {take.title ? <p className="mt-2 font-display text-lg text-white">{take.title}</p> : null}
                    <p className="mt-2 text-sm leading-6">
                      {take.textBody}
                    </p>
                    {take.status === "error" ? (
                      <button
                        type="button"
                        onClick={() =>
                          setOptimisticTakes((prev) => prev.filter((candidate) => candidate.id !== take.id))
                        }
                        className="mt-3 text-xs uppercase tracking-[0.3em] text-red-200 underline-offset-4 hover:underline"
                      >
                        Dismiss
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </SignedIn>
    </div>
  );
}
