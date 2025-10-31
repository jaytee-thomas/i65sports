import "@/styles/globals.css";
import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import BrandMark from "./components/BrandMark";
import Link from "next/link";
import ToastProvider from "./components/ToastProvider";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable. Set it in your .env file.");
}

const navLinks = [
  { href: "/", label: "Highlights" },
  { href: "/hot-takes", label: "Hot Takes" },
  { href: "/reels", label: "Fan Reels" },
  { href: "/columnists", label: "Columnists" },
];

export const metadata: Metadata = {
  title: "i65 Sports",
  description: "Live odds, bold takes, and authentic fan energy in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en">
        <body className="min-h-screen bg-midnight font-sans text-neutral-200 antialiased">
          <ToastProvider>
            <div className="pointer-events-none fixed inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-emerald-500/10 via-midnight to-midnight blur-3xl" />
            <header className="sticky top-0 z-40 border-b border-ash/60 bg-midnight/80 backdrop-blur">
              <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4">
                <BrandMark />
                <nav className="flex items-center gap-1 rounded-full border border-ash/60 bg-graphite/80 px-2 py-1 text-xs uppercase tracking-wide">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-full px-3 py-1 font-medium text-neutral-300 transition hover:bg-ash/60 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="ml-auto flex items-center gap-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-2 font-medium uppercase tracking-[0.32em] text-neon-emerald">
                    Live
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-emerald/70"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-emerald"></span>
                    </span>
                  </span>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="rounded-full border border-ash/60 bg-graphite/80 px-4 py-1.5 text-[11px] uppercase tracking-[0.32em] text-neutral-300 transition hover:border-neon-emerald/60 hover:text-white">
                        Sign in
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "h-8 w-8 border border-ash/60 shadow-glow-blue",
                        },
                      }}
                    />
                  </SignedIn>
                </div>
              </div>
            </header>
            <main className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col gap-10 px-4 py-10">
              {children}
            </main>
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
