// Animated pulsing placeholder matching PropertyCard dimensions
export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-graphite shadow-card">
      <div className="h-52 w-full animate-pulse bg-sand" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-1/3 animate-pulse rounded bg-sand" />
        <div className="h-4 w-full animate-pulse rounded bg-sand" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-sand" />
        <div className="h-9 w-full animate-pulse rounded bg-sand" />
      </div>
    </div>
  );
}
