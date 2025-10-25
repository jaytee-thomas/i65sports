import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import HotTakeRecorder from "../components/HotTakeRecorder";
import HotTakeComposer from "./HotTakeComposer";
import HotTakeFeed from "./HotTakeFeed";
import type { AuthorOption } from "./types";

export default async function HotTakesPage() {
  let authors: AuthorOption[] = [];

  try {
    authors = await prisma.user.findMany({
      orderBy: { username: "asc" },
      select: { id: true, username: true, role: true },
    });
  } catch (error) {
    console.error("[hot-takes] Failed to load authors", error);
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Daily Hot Takes</h1>
        <p className="max-w-2xl text-sm text-neutral-400">
          Record a 60s take and publish. Others can reply with text, audio or video.
          Columnists’ takes surface first, followed by the community feed.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Suspense
            fallback={
              <div className="rounded-xl border border-neutral-800 p-6 text-sm text-neutral-400">
                Loading latest hot takes…
              </div>
            }
          >
            {/* Server component renders the top 10 most recent takes */}
            <HotTakeFeed replyAuthors={authors} />
          </Suspense>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
            <h2 className="text-lg font-semibold">Publish a Text Take</h2>
            <p className="text-sm text-neutral-400">
              Share a quick opinion while we finish wiring up video uploads.
            </p>
            <div className="mt-4">
              <HotTakeComposer authors={authors} />
            </div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
            <h2 className="text-lg font-semibold">Record a Hot Take</h2>
            <p className="text-sm text-neutral-400">
              60 seconds max. Use it to hype your team, call an upset, or react to another take.
            </p>
            <div className="mt-4">
              <HotTakeRecorder />
            </div>
          </div>
          <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950/40 p-4 text-sm text-neutral-500">
            Publishing flow coming soon — for now this demo keeps recordings local.
          </div>
        </aside>
      </div>
    </div>
  );
}
