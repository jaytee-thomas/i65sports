import OddsTicker from "./components/OddsTicker";

export default function Page() {
  return (
    <div className="space-y-6">
      <OddsTicker />
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Daily Highlights</h2>
        <p className="opacity-70">Editor-curated clips & stories. (Wire this to your CMS later.)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-xl border border-neutral-800 p-4">
              <div className="aspect-video rounded bg-neutral-900 mb-3" />
              <div className="font-medium">Highlight #{i}</div>
              <div className="text-sm opacity-70">Quick description goes here.</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
