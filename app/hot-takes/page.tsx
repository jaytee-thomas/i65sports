import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import HotTakeRecorder from "../components/HotTakeRecorder";
import HotTakeComposer from "./HotTakeComposer";
import HotTakeFeed from "./HotTakeFeed";
import MyHotTakes from "../components/MyHotTakes";
import Link from "next/link";

export default function HotTakesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight via-graphite to-midnight">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">
            Hot Takes
          </h1>
          <Link
            href="/hot-takes/feed"
            className="rounded-full border border-neon-emerald/60 bg-graphite/80 px-4 py-2 text-sm uppercase tracking-wider text-neon-emerald transition hover:bg-neon-emerald hover:text-midnight"
          >
            View Community Feed
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Feed */}
            <section>
              <HotTakeFeed />
            </section>

            {/* My Hot Takes */}
            <SignedIn>
              <section>
                <MyHotTakes />
              </section>
            </SignedIn>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Text Composer */}
            <section>
              <h2 className="mb-4 text-lg font-bold uppercase tracking-tight text-white">
                Publish a Text Take
              </h2>
              <HotTakeComposer />
            </section>

            {/* Video Recorder */}
            <section>
              <h2 className="mb-4 text-lg font-bold uppercase tracking-tight text-white">
                Record a Hot Take
              </h2>
              <HotTakeRecorder />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
