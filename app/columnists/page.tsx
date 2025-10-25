export default function ColumnistsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Columnists</h1>
      <p className="opacity-70">This section will list your featured writers and their latest articles.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1,2].map(i => (
          <div key={i} className="rounded-xl border border-neutral-800 p-4">
            <div className="font-semibold">Columnist #{i}</div>
            <div className="text-sm opacity-70">Bio and latest article preview.</div>
          </div>
        ))}
      </div>
    </div>
  );
}
