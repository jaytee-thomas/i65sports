"use client";

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { useState, useTransition } from "react";
import { createReply } from "./actions";

type Notice =
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export default function ReplyForm({ takeId }: { takeId: string }) {
  const { user } = useUser();
  const [textBody, setTextBody] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    startTransition(async () => {
      const result = await createReply({
        takeId,
        textBody,
      });

      if (result.success) {
        setTextBody("");
        setNotice({ type: "success", message: "Reply posted." });
      } else {
        setNotice({ type: "error", message: result.error });
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
          <textarea
            className="h-24 w-full resize-none rounded-2xl border border-ash/60 bg-iron/80 px-4 py-3 text-sm leading-6 text-neutral-100 transition focus:border-neon-emerald focus:outline-none"
            placeholder="Keep it respectful. Fire back with your POV."
            value={textBody}
            onChange={(event) => setTextBody(event.target.value)}
            maxLength={360}
          />

          {notice && (
            <div
              className={`rounded-2xl border px-4 py-2 text-xs ${
                notice.type === "success"
                  ? "border-neon-emerald/60 bg-neon-emerald/10 text-neon-emerald"
                  : "border-red-700/60 bg-red-900/20 text-red-300"
              }`}
            >
              {notice.message}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>
              Replying as{" "}
              <span className="text-neutral-200">
                {user?.username ||
                  user?.firstName?.concat(user.lastName ? ` ${user.lastName}` : "") ||
                  user?.primaryEmailAddress?.emailAddress ||
                  "you"}
              </span>
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
