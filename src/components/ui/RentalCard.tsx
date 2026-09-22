import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, MessageCircle, MapPin } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { RentalListing } from "@/lib/types";
import { formatRM, waLink } from "@/lib/constants";

export default function RentalCard({ rental }: { rental: RentalListing }) {
  const available = (rental.status || "available").toLowerCase() === "available";
  const statusLabel = available
    ? null
    : rental.status.charAt(0).toUpperCase() + rental.status.slice(1);

  const inquiryMessage = `Hi Balqis, saya berminat untuk sewa rumah ini: ${rental.title} di ${rental.area || rental.city}. Boleh share more details?`;

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-peach bg-graphite shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${
        available ? "" : "opacity-80 grayscale"
      }`}
    >
      <Link
        href={`/rental/${rental.id}`}
        className="absolute inset-0 z-[1]"
        aria-label={rental.title}
      />

      <div className="relative h-52 w-full">
        {rental.coverImage ? (
          <Image
            src={rental.coverImage}
            alt={rental.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div
            className="h-full w-full bg-gradient-to-br from-sand via-peach to-copper/50"
            aria-hidden
          />
        )}
        <div className="absolute left-3 top-3 z-[2] flex flex-wrap gap-2">
          {rental.type && (
            <Badge variant={available ? "rent" : "sold"}>
              {available ? rental.type : statusLabel}
            </Badge>
          )}
        </div>
        {!available && (
          <div className="absolute inset-0 z-[2] flex items-center justify-center">
            <span className="-rotate-12 rounded-md border-4 border-white/90 px-4 py-1 text-2xl font-extrabold uppercase tracking-widest text-white/90 [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]">
              {statusLabel}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-lg font-bold text-copper">
          {rental.price > 0 ? `${formatRM(rental.price)}/month` : "Price on Request"}
        </p>
        <h3 className="mt-1 line-clamp-2 font-semibold text-espresso">
          {rental.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-warm-grey">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {rental.area || rental.city}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-peach pt-3">
          <div className="flex items-center gap-3 text-sm text-warm-grey">
            {rental.bedrooms !== null && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-4 w-4" aria-hidden />
                {rental.bedrooms}
              </span>
            )}
            {rental.bathrooms !== null && (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" aria-hidden />
                {rental.bathrooms}
              </span>
            )}
          </div>

          <a
            href={waLink(inquiryMessage)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp inquiry about ${rental.title}`}
            className="relative z-[2] rounded-full bg-[#25D366] p-2 text-white transition-transform hover:scale-110"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
}
