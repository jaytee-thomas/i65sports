export const metadata = {
  title: "i65 Sports",
  description: "Fan Reels, Hot Takes, Columnists & Live Odds",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="border-b border-neutral-800 sticky top-0 z-20 bg-neutral-950/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
            <div className="font-bold tracking-wide">i65 Sports</div>
            <nav className="text-sm opacity-80 flex gap-4">
              <a href="/" className="hover:opacity-100">Highlights</a>
              <a href="/hot-takes" className="hover:opacity-100">Hot Takes</a>
              <a href="/reels" className="hover:opacity-100">Fan Reels</a>
              <a href="/columnists" className="hover:opacity-100">Columnists</a>
            </nav>
            <div className="ml-auto text-xs opacity-70">MVP Starter</div>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
