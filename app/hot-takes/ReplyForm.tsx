"use client";

import { useEffect, useState, useTransition } from "react";
import { createReply } from "./actions";
import type { AuthorOption } from "./types";

type Props = {
  takeId: string;
  authors: AuthorOption[];
};

type Notice =
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export default function ReplyForm({ takeId, authors }: Props) {
  const [authorId, setAuthorId] = useState(authors[0]?.id ?? "");
  const [textBody, setTextBody] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (authors.length === 0 && authorId !== "") {
      setAuthorId("");
    } else if (authors.length > 0 && !authors.some((author) => author.id === authorId)) {
      setAuthorId(authors[0].id);
    }
  }, [authors, authorId]);

  const disabled = isPending || authors.length === 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    if (!authorId) {
      setNotice({ type: "error", message: "Add users in the database to enable replies." });
      return;
    }

    startTransition(async () => {
      const result = await createReply({
        authorId,
        takeId,
        textBody,
      });

      if (result.success) {
        setTextBody("");
        setNotice({ type: "success", message: "Reply added." });
      } else {
        setNotice({ type: "error", message: result.error });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border-t border-neutral-800 px-3 py-3">
      <div className="flex flex-col gap-2 md:flex-row">
        <select
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 focus:border-emerald-500 focus:outline-none md:w-56"
          value={authorId}
          onChange={(event) => setAuthorId(event.target.value)}
          disabled={disabled}
        >
          {authors.length === 0 ? (
            <option value="">Add users to reply</option>
          ) : (
            authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.username} · {author.role.toLowerCase()}
              </option>
            ))
          )}
        </select>
        <textarea
          className="h-20 w-full resize-none rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm leading-6 text-neutral-100 focus:border-emerald-500 focus:outline-none"
          placeholder="Keep it respectful. Add your take back."
          value={textBody}
          onChange={(event) => setTextBody(event.target.value)}
          disabled={disabled}
          maxLength={360}
        />
      </div>

      {notice && (
        <div
          className={`rounded border px-3 py-2 text-xs ${
            notice.type === "success"
              ? "border-emerald-700 bg-emerald-900/40 text-emerald-200"
              : "border-red-800 bg-red-950/40 text-red-200"
          }`}
        >
          {notice.message}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
        >
          {isPending ? "Posting…" : "Reply"}
        </button>
      </div>
    </form>
  );
}
