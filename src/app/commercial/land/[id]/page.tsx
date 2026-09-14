import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandPlot, Ruler, MapPin, MessageCircle } from "lucide-react";
import { fetchLand } from "@/lib/airtable-land";
import { formatRM, waLink } from "@/lib/constants";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/ui/Badge";
import Gallery from "@/components/listing/Gallery";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

async function getLand(id: string) {
  try {
    return await fetchLand(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const land = await getLand(params.id);
  if (!land) return { title: "Listing Not Found" };

  const description = (
    land.description || `${land.title} in ${land.area || land.city}, Johor. Contact Balqis of BalqisMJ Property.`
  ).slice(0, 160);

  return {
    title: `${land.title} | ${land.area || land.city}`,
    description,
    openGraph: {
      title: land.title,
      description,
      type: "article",
      images: land.coverImage ? [{ url: land.coverImage }] : [],
    },
  };
}

export default async function LandDetailPage({ params }: Props) {
  const land = await getLand(params.id);
  if (!land) notFound();

  const available = (land.status || "available").toLowerCase() === "available";
  const priceLabel = land.marketValue ? formatRM(land.marketValue) : "Price on Request";
  const inquiryUrl = waLink(
    `Hi Balqis, saya berminat dengan tanah ini: ${land.title} di ${land.area || "Johor Bahru"}. Boleh share more details?`
  );

  // Show both acreage and buildable sqft whenever each is present.
  const stats = [
    { icon: LandPlot, label: "Land Area", value: land.acres !== null ? `${land.acres} acres` : null },
    {
      icon: Ruler,
      label: "Build-up",
      value: land.buildUpSqft !== null ? `${land.buildUpSqft.toLocaleString()} sqft` : null,
    },
  ].filter((s) => s.value !== null);

  const badges = [land.category, land.lotStatus, land.ownership, land.rezabTanah, land.mukim].filter(
    Boolean
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 lg:pb-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Land", href: "/commercial/land" },
          { label: land.title },
        ]}
      />

      <Gallery images={land.images} title={land.title} />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {!available && <Badge variant="sold">{land.status.charAt(0).toUpperCase() + land.status.slice(1)}</Badge>}
            {badges.map((b) => (
              <Badge key={b}>{b}</Badge>
            ))}
          </div>

          <h1 className="mt-3 font-display text-3xl font-bold text-espresso md:text-4xl">
            {land.title}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-warm-grey">
            <MapPin className="h-4 w-4 shrink-0 text-copper" aria-hidden />
            {[land.area, land.city].filter(Boolean).join(", ")}
          </p>
          <p className="mt-4 font-display text-3xl font-bold text-copper lg:hidden">
            {priceLabel}
          </p>

          {stats.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-peach bg-graphite p-4 shadow-card">
                  <s.icon className="h-5 w-5 text-copper" aria-hidden />
                  <p className="mt-2 text-xs text-warm-grey">{s.label}</p>
                  <p className="font-semibold text-espresso">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {land.description && (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-bold text-espresso">
                About this land
              </h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-espresso/90">
                {land.description}
              </p>
            </section>
          )}

          {land.mapEmbedUrl && (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-bold text-espresso">Location</h2>
              <div className="mt-4 overflow-hidden rounded-2xl shadow-card">
                <iframe
                  src={land.mapEmbedUrl}
                  title={`Map location of ${land.title}`}
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
          {/* Desktop sticky sidebar card */}
          <div className="hidden rounded-2xl border border-peach bg-graphite p-6 shadow-card lg:block">
            <p className="text-sm text-warm-grey">Price</p>
            <p className="font-display text-3xl font-bold text-copper">{priceLabel}</p>
            <div className="mt-5">
              <a
                href={inquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1eb857]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                Inquire via WhatsApp
              </a>
            </div>
            <p className="mt-4 text-xs text-warm-grey">
              Typically responds within 1–2 hours during business hours (9am–9pm).
            </p>
          </div>

          {/* Mobile sticky bottom bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-peach bg-graphite px-4 py-3 pr-24 shadow-[0_-4px_24px_rgba(62,41,34,0.18)] lg:hidden">
            <p className="font-display text-lg font-bold text-copper">{priceLabel}</p>
            <a
              href={inquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Inquire
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
