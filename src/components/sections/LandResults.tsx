"use client";

import type { LandListing } from "@/lib/types";
import LandCard from "@/components/ui/LandCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorBanner from "@/components/ui/ErrorBanner";

export default function LandResults({
  land,
  loading,
  error,
  columns = "sm:grid-cols-2 xl:grid-cols-3",
}: {
  land: LandListing[];
  loading: boolean;
  error: string | null;
  columns?: string;
}) {
  return (
    <div className={`grid grid-cols-1 gap-6 ${columns}`}>
      {loading &&
        Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      {!loading && error && <ErrorBanner />}
      {!loading && !error && land.length === 0 && <EmptyState />}
      {!loading &&
        !error &&
        land.map((l) => <LandCard key={l.id} land={l} />)}
    </div>
  );
}
