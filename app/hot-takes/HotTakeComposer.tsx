"use client";

import { useEffect, useState, useTransition } from "react";
import { createHotTake } from "./actions";
import type { AuthorOption } from "./types";

type Props = {
  authors: AuthorOption[];
};

type Notice =
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export default function HotTakeComposer({ authors }: Props) {
  const [authorId, setAuthorId] = useState(authors[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [textBody, setTextBody] = useState("");
  const [tags, setTags] = useState("");
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
      setNotice({ type: "error", message: "Add at least one user in Prisma before publishing." });
      return;
    }

    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    startTransition(async () => {
      const result = await createHotTake({
        authorId,
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
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Posting as
        </label>
        <select
          className="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
          value={authorId}
          onChange={(event) => setAuthorId(event.target.value)}
          disabled={disabled}
        >
          {authors.length === 0 ? (
            <option value="">Add users to enable publishing</option>
          ) : (
            authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.username} · {author.role.toLowerCase()}
              </option>
            ))
          )}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Title (optional)
        </label>
        <input
          className="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
          placeholder="Example: Colts are winning the AFC"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Your take
        </label>
        <textarea
          className="mt-1 h-28 w-full resize-none rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm leading-6 text-neutral-100 focus:border-emerald-500 focus:outline-none"
          placeholder="You’ve got 60 seconds — tell us your boldest take."
          value={textBody}
          onChange={(event) => setTextBody(event.target.value)}
          disabled={disabled}
          maxLength={500}
        />
        <div className="mt-1 text-right text-xs text-neutral-500">
          {textBody.length}/500
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Tags (comma separated)
        </label>
        <input
          className="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500 focus:outline-none"
          placeholder="colts, afc, preseason"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          disabled={disabled}
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

      <button
        type="submit"
        className="w-full rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
      >
        {isPending ? "Publishing…" : "Publish Hot Take"}
      </button>
    </form>
  );
}
