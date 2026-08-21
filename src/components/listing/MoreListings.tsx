"use client";

import { useListings } from "@/hooks/useListings";
import PropertyCard from "@/components/ui/PropertyCard";
import SkeletonCard from "@/components/ui/SkeletonCard";

// "More listings in [area]" — pulled from /api/listings, filtered client-side
export default function MoreListings({
  areas,
  excludeId,
}: {
  areas: string[];
  excludeId: string;
}) {
  const { listings, loading, error } = useListings();

  if (error || areas.length === 0) return null;

  const related = listings
    .filter((l) => l.id !== excludeId && l.areas.some((a) => areas.includes(a)))
    .slice(0, 3);

  if (!loading && related.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-bold text-espresso">
        More listings in {areas[0]}
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : related.map((l) => <PropertyCard key={l.id} listing={l} />)}
      </div>
    </section>
  );
}
