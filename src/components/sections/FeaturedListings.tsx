import PropertyCard from "@/components/ui/PropertyCard";
import type { Listing } from "@/lib/types";

// Featured listings are passed down from the homepage's own server-side
// Airtable fetch — avoids a second round trip to re-fetch the same data
// client-side just for this section.
export default function FeaturedListings({ listings }: { listings: Listing[] }) {
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
          {featured.length === 0 && (
            <p className="col-span-full text-center text-warm-grey">
              New featured listings coming soon — WhatsApp Balqis for the
              latest properties.
            </p>
          )}
          {featured.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}
