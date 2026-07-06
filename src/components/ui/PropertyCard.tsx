import Image from "next/image";
import Link from "next/link";
import {
  BedDouble,
  Bath,
  Ruler,
  MessageCircle,
  MapPin,
} from "lucide-react";
import Badge, { listingTypeLabel } from "@/components/ui/Badge";
import type { Listing } from "@/lib/types";
import { priceLabel, waLink } from "@/lib/constants";

function inquiryMessage(listing: Listing): string {
  if (listing.listingType === "room-rent") {
    return `Hi Balqis, I'm interested in a room rental in ${listing.area || "Johor Bahru"}. Can you share available options?`;
  }
  return `Hi Balqis, saya berminat dengan property ini: ${listing.title} di ${listing.area || "Johor Bahru"}. Boleh share more details?`;
}

export default function PropertyCard({ listing }: { listing: Listing }) {
  const available = (listing.status || "available").toLowerCase() === "available";
  const statusLabel = available
    ? null
    : listing.status.charAt(0).toUpperCase() + listing.status.slice(1);
  const isRoom = listing.listingType === "room-rent";

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${
        available ? "" : "opacity-80 grayscale"
      }`}
    >
      {/* Stretched link keeps the WhatsApp button as a separate tap target */}
      <Link
        href={`/listings/${listing.id}`}
        className="absolute inset-0 z-[1]"
        aria-label={listing.title}
      />

      <div className="relative h-52 w-full">
        {listing.coverImage ? (
          <Image
            src={listing.coverImage}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div
            className="h-full w-full bg-gradient-to-br from-sand via-[#e0d2c0] to-mocha/40"
            aria-hidden
          />
        )}
        <div className="absolute left-3 top-3 z-[2] flex gap-2">
          <Badge variant={available ? listing.listingType : "sold"}>
            {available
              ? listingTypeLabel[listing.listingType] || listing.listingType || "Listing"
              : statusLabel}
          </Badge>
          {listing.isNew && available && <Badge variant="rent">New</Badge>}
        </div>
      </div>

      <div className="p-4">
        <p className="text-lg font-bold text-copper">{priceLabel(listing)}</p>
        <h3 className="mt-1 line-clamp-2 font-semibold text-espresso">
          {listing.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-warm-grey">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {listing.area || listing.city}
          {listing.subType ? ` · ${listing.subType}` : ""}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-sand pt-3">
          {isRoom ? (
            <div className="flex flex-wrap gap-1.5">
              {listing.furnishing && (
                <span className="rounded-full bg-sand px-2 py-0.5 text-xs text-espresso">
                  {listing.furnishing}
                </span>
              )}
              {listing.amenities.slice(0, 2).map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-sand px-2 py-0.5 text-xs text-espresso"
                >
                  {a}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm text-warm-grey">
              {listing.bedrooms !== null && (
                <span className="flex items-center gap-1">
                  <BedDouble className="h-4 w-4" aria-hidden />
                  {listing.bedrooms}
                </span>
              )}
              {listing.bathrooms !== null && (
                <span className="flex items-center gap-1">
                  <Bath className="h-4 w-4" aria-hidden />
                  {listing.bathrooms}
                </span>
              )}
              {listing.builtUpSqft !== null && (
                <span className="flex items-center gap-1">
                  <Ruler className="h-4 w-4" aria-hidden />
                  {listing.builtUpSqft.toLocaleString()} sqft
                </span>
              )}
            </div>
          )}

          <a
            href={waLink(inquiryMessage(listing))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp inquiry about ${listing.title}`}
            className="relative z-[2] rounded-full bg-[#25D366] p-2 text-white transition-transform hover:scale-110"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
}
