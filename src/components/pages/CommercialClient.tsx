"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useShoplots } from "@/hooks/useShoplots";
import { useLand } from "@/hooks/useLand";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ListingsResults from "@/components/sections/ListingsResults";
import LandResults from "@/components/sections/LandResults";

const subNav = [
  { href: "/commercial", label: "All Commercial", key: "all" },
  { href: "/commercial/shop-lot", label: "Shop Lot", key: "shop-lot" },
  { href: "/commercial/land", label: "Land", key: "land" },
];

// Shop lots and land live in separate Airtable tables with different
// schemas, so this overview shows a preview of each rather than one
// unified grid — "View all" links to their dedicated, filterable pages.
export default function CommercialClient() {
  const { shoplots, loading: shoplotsLoading, error: shoplotsError } = useShoplots();
  const { land, loading: landLoading, error: landError } = useLand();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Commercial" }]} />
      <h1 className="font-display text-3xl font-bold text-espresso md:text-4xl">
        Commercial Properties in Johor
      </h1>
      <p className="mt-2 text-warm-grey">Shop lots and land across Johor Bahru and Johor.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {subNav.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              tab.key === "all"
                ? "bg-teal text-white"
                : "border border-teal/40 text-teal hover:bg-teal hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-espresso">Shop Lots</h2>
          <Link
            href="/commercial/shop-lot"
            className="flex items-center gap-1 text-sm font-semibold text-teal hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-5">
          <ListingsResults
            listings={shoplots.slice(0, 3)}
            loading={shoplotsLoading}
            error={shoplotsError}
            hrefBase="/commercial/shop-lot"
          />
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-espresso">Land</h2>
          <Link
            href="/commercial/land"
            className="flex items-center gap-1 text-sm font-semibold text-teal hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-5">
          <LandResults land={land.slice(0, 3)} loading={landLoading} error={landError} />
        </div>
      </section>
    </div>
  );
}
