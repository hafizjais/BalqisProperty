"use client";

import type { RentalListing } from "@/lib/types";
import RentalCard from "@/components/ui/RentalCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorBanner from "@/components/ui/ErrorBanner";

export default function RentalResults({
  rental,
  loading,
  error,
  columns = "sm:grid-cols-2 xl:grid-cols-3",
}: {
  rental: RentalListing[];
  loading: boolean;
  error: string | null;
  columns?: string;
}) {
  return (
    <div className={`grid grid-cols-1 gap-6 ${columns}`}>
      {loading &&
        Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      {!loading && error && <ErrorBanner />}
      {!loading && !error && rental.length === 0 && <EmptyState />}
      {!loading &&
        !error &&
        rental.map((r) => <RentalCard key={r.id} rental={r} />)}
    </div>
  );
}
