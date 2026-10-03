import type { Metadata } from "next";
import { TrainFront, Map, Wallet, MessageCircle } from "lucide-react";
import { fetchAllListings } from "@/lib/listings";
import { fetchAllRental } from "@/lib/rental";
import { fetchAllShoplots } from "@/lib/shoplot";
import { fetchAllLand } from "@/lib/land";
import { fetchAllProjects } from "@/lib/project";
import HeroSection from "@/components/sections/HeroSection";
import CategoryCards from "@/components/sections/CategoryCards";
import FeaturedListings from "@/components/sections/FeaturedListings";
import Button from "@/components/ui/Button";
import { waLink } from "@/lib/constants";

export const metadata: Metadata = {
  title: "BalqisMJ Property | Buy, Sell & Rent Property in Johor Bahru",
  description:
    "Your trusted property partner in Johor Bahru. Browse houses for sale, rentals, rooms and commercial properties across JB with Nurul Balqis of BalqisMJ Property.",
};

const whyJB = [
  {
    icon: TrainFront,
    title: "RTS Link",
    text: "Direct rail link to Singapore Woodlands by 2026",
  },
  {
    icon: Map,
    title: "Iskandar Malaysia",
    text: "Southeast Asia's largest development corridor",
  },
  {
    icon: Wallet,
    title: "Affordable Prices",
    text: "Premium properties at a fraction of Singapore costs",
  },
];

// Areas too broad to be a useful one-tap search keyword.
const GENERIC_AREAS = new Set(["johor bahru", "johor", "jb"]);

export default async function HomePage() {
  const [listings, rental, shoplots, land, projects] = await Promise.all([
    fetchAllListings().catch(() => []),
    fetchAllRental().catch(() => []),
    fetchAllShoplots().catch(() => []),
    fetchAllLand().catch(() => []),
    fetchAllProjects().catch(() => []),
  ]);

  // Hero search data, from live listings across every category: the most
  // common areas become one-tap keywords, and every area plus every project
  // name feeds the search box's suggestions.
  const allAreas = [listings, rental, shoplots, land, projects].flatMap((items) =>
    items.flatMap((item) => item.areas)
  );
  // Plain object rather than Map — `Map` here is the lucide icon import.
  const areaCounts: Record<string, number> = {};
  for (const area of allAreas) {
    if (!GENERIC_AREAS.has(area.toLowerCase())) {
      areaCounts[area] = (areaCounts[area] || 0) + 1;
    }
  }
  const popularAreas = Object.entries(areaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([area]) => area);
  const suggestions = Array.from(
    new Set([...allAreas, ...projects.map((p) => p.projectName)].filter(Boolean))
  ).sort();
  const totalCount =
    listings.length + rental.length + shoplots.length + land.length + projects.length;

  return (
    <>
      <HeroSection
        popularAreas={popularAreas}
        suggestions={suggestions}
        totalCount={totalCount}
      />
      {/* Category cards overlap the hero's bottom edge */}
      <CategoryCards />

      {/* Why Johor Bahru? */}
      <section className="bg-cream py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-copper">
            Invest with confidence
          </p>
          <h2 className="mt-3 text-center font-display text-3xl font-bold text-espresso">
            Why Johor Bahru?
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {whyJB.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-peach bg-graphite p-6 text-center shadow-card transition-colors hover:border-copper/40"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink text-copper">
                  <item.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold text-espresso">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-warm-grey">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedListings listings={listings} />

      {/* WhatsApp CTA band */}
      <section className="border-y border-copper/25 bg-ink">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-14 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <div>
            <p className="font-display text-2xl font-bold text-copper">
              Not sure where to start? Let&apos;s chat.
            </p>
            <p className="mt-1 text-sm text-cream/80">
              Tell Balqis what you need — she&apos;ll do the searching for you.
            </p>
          </div>
          <Button
            variant="light"
            href={waLink("Hi Balqis, I'm not sure where to start. Can you guide me?")}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            WhatsApp Balqis
          </Button>
        </div>
      </section>
    </>
  );
}
