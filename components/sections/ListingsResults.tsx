"use client";

import type { Listing } from "@/lib/types";
import PropertyCard from "@/components/ui/PropertyCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorBanner from "@/components/ui/ErrorBanner";

export default function ListingsResults({
  listings,
  loading,
  error,
  columns = "sm:grid-cols-2 xl:grid-cols-3",
}: {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  columns?: string;
}) {
  return (
    <div className={`grid grid-cols-1 gap-6 ${columns}`}>
      {loading &&
        Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      {!loading && error && <ErrorBanner />}
      {!loading && !error && listings.length === 0 && <EmptyState />}
      {!loading &&
        !error &&
        listings.map((listing) => (
          <PropertyCard key={listing.id} listing={listing} />
        ))}
    </div>
  );
}
