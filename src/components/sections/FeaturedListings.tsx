"use client";

import { useListings } from "@/hooks/useListings";
import PropertyCard from "@/components/ui/PropertyCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import ErrorBanner from "@/components/ui/ErrorBanner";

// Pull from the listings sheet where featured = true, across all listingTypes
export default function FeaturedListings() {
  const { listings, loading, error } = useListings();
  const featured = listings.filter((l) => l.featured).slice(0, 6);

  return (
    <section className="bg-gradient-to-b from-cream via-sand to-cream py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-bold text-espresso">
          Featured Listings
        </h2>
        <p className="mt-2 text-center text-warm-grey">
          Hand-picked properties across Johor Bahru
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          {!loading && error && <ErrorBanner />}
          {!loading && !error && featured.length === 0 && (
            <p className="col-span-full text-center text-warm-grey">
              New featured listings coming soon — WhatsApp Balqis for the
              latest properties.
            </p>
          )}
          {!loading &&
            !error &&
            featured.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
        </div>
      </div>
    </section>
  );
}
