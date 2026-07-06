import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BedDouble,
  Bath,
  Car,
  Ruler,
  LandPlot,
  ScrollText,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { fetchListing } from "@/lib/sheets";
import { priceLabel } from "@/lib/constants";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge, { listingTypeLabel } from "@/components/ui/Badge";
import Gallery from "@/components/listing/Gallery";
import InquiryPanel from "@/components/listing/InquiryPanel";
import MoreListings from "@/components/listing/MoreListings";

export const revalidate = 300;

type Props = { params: { id: string } };

async function getListing(id: string) {
  try {
    return await fetchListing(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing(params.id);
  if (!listing) return { title: "Listing Not Found" };

  const description = (
    listing.description ||
    `${listing.title} in ${listing.area || listing.city}, ${listing.state}. ${priceLabel(listing)}. Contact Balqis of BalqisMJ Property.`
  ).slice(0, 160);

  return {
    title: `${listing.title} | ${listing.area || listing.city}`,
    description,
    openGraph: {
      title: listing.title,
      description,
      type: "article",
      images: listing.coverImage ? [{ url: listing.coverImage }] : [],
    },
  };
}

function categoryCrumb(listing: { listingType: string; propertyType: string }) {
  if (listing.propertyType.toLowerCase() === "commercial") {
    return { label: "Commercial", href: "/commercial" };
  }
  const map: Record<string, { label: string; href: string }> = {
    sale: { label: "Buy Property", href: "/buy" },
    rent: { label: "Rent a House", href: "/rent-house" },
    "room-rent": { label: "Rent a Room", href: "/rent-room" },
  };
  return map[listing.listingType] || { label: "Listings", href: "/buy" };
}

export default async function ListingDetailPage({ params }: Props) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  const available = (listing.status || "available").toLowerCase() === "available";
  const cat = categoryCrumb(listing);

  const stats = [
    { icon: BedDouble, label: "Bedrooms", value: listing.bedrooms },
    { icon: Bath, label: "Bathrooms", value: listing.bathrooms },
    { icon: Car, label: "Car Park", value: listing.carPark },
    {
      icon: Ruler,
      label: "Built-up",
      value: listing.builtUpSqft ? `${listing.builtUpSqft.toLocaleString()} sqft` : null,
    },
    {
      icon: LandPlot,
      label: "Land Size",
      value: listing.landSqft ? `${listing.landSqft.toLocaleString()} sqft` : null,
    },
    { icon: ScrollText, label: "Tenure", value: listing.tenure || null },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 lg:pb-8">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, cat, { label: listing.title }]}
      />

      <Gallery images={listing.images} title={listing.title} />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={available ? listing.listingType : "sold"}>
              {available
                ? listingTypeLabel[listing.listingType] || listing.listingType || "Listing"
                : listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
            </Badge>
            {listing.isNew && available && <Badge variant="rent">New</Badge>}
            {listing.furnishing && <Badge>{listing.furnishing}</Badge>}
          </div>

          <h1 className="mt-3 font-display text-3xl font-bold text-espresso md:text-4xl">
            {listing.title}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-warm-grey">
            <MapPin className="h-4 w-4 shrink-0 text-copper" aria-hidden />
            {[listing.address, listing.area, listing.city, listing.state]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p className="mt-4 font-display text-3xl font-bold text-copper lg:hidden">
            {priceLabel(listing)}
          </p>

          {/* Key stats grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-graphite p-4 shadow-card">
                <s.icon className="h-5 w-5 text-copper" aria-hidden />
                <p className="mt-2 text-xs text-warm-grey">{s.label}</p>
                <p className="font-semibold text-espresso">
                  {s.value ?? "—"}
                </p>
              </div>
            ))}
          </div>

          {listing.amenities.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-bold text-espresso">
                Amenities
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {listing.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-espresso">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-copper" aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {listing.description && (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-bold text-espresso">
                About this property
              </h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-espresso/90">
                {listing.description}
              </p>
            </section>
          )}

          {listing.mapEmbedUrl && (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-bold text-espresso">
                Location
              </h2>
              <div className="mt-4 overflow-hidden rounded-2xl shadow-card">
                <iframe
                  src={listing.mapEmbedUrl}
                  title={`Map location of ${listing.title}`}
                  className="h-80 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24">
          <InquiryPanel listing={listing} />
        </aside>
      </div>

      <MoreListings area={listing.area} excludeId={listing.id} />
    </div>
  );
}
