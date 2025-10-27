"use client";

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { useState, useTransition } from "react";
import { createHotTake } from "./actions";

type Notice =
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export default function HotTakeComposer() {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [textBody, setTextBody] = useState("");
  const [tags, setTags] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isPending, startTransition] = useTransition();

  const displayName =
    user?.username ||
    user?.firstName?.concat(user.lastName ? ` ${user.lastName}` : "") ||
    user?.primaryEmailAddress?.emailAddress ||
    "You";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    startTransition(async () => {
      const result = await createHotTake({
        title,
        textBody,
        tags: tagList,
      });

      if (result.success) {
        setNotice({ type: "success", message: "Hot take published." });
        setTitle("");
        setTextBody("");
        setTags("");
      } else {
        setNotice({ type: "error", message: result.error });
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

          {notice && (
            <div
              className={`rounded-2xl border px-4 py-3 text-xs ${
                notice.type === "success"
                  ? "border-neon-emerald/60 bg-neon-emerald/10 text-neon-emerald"
                  : "border-red-700/60 bg-red-900/20 text-red-300"
              }`}
            >
              {notice.message}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-full border border-neon-emerald/60 bg-gradient-to-r from-graphite via-iron to-graphite px-5 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-neon-emerald transition hover:-translate-y-0.5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
          >
            {isPending ? "Publishing…" : "Publish Hot Take"}
          </button>
        </form>
      </SignedIn>
    </div>
  );
}
