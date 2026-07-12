"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useListings } from "@/hooks/useListings";
import {
  applyFilters,
  defaultFilters,
  isCommercial,
  isShopLot,
  isLand,
} from "@/lib/filters";
import Breadcrumb from "@/components/ui/Breadcrumb";
import FilterBar from "@/components/sections/FilterBar";
import ListingsResults from "@/components/sections/ListingsResults";

type Category = "all" | "shop-lot" | "land";

const meta: Record<Category, { title: string; crumb: string | null }> = {
  all: { title: "Commercial Properties in Johor", crumb: null },
  "shop-lot": { title: "Shop Lots For Sale in Johor", crumb: "Shop Lot" },
  land: { title: "Land For Sale in Johor", crumb: "Land" },
};

const subNav = [
  { href: "/commercial", label: "All Commercial", key: "all" },
  { href: "/commercial/shop-lot", label: "Shop Lot", key: "shop-lot" },
  { href: "/commercial/land", label: "Land", key: "land" },
];

export default function CommercialClient({
  category = "all",
}: {
  category?: Category;
}) {
  const { listings, loading, error } = useListings();
  const [filters, setFilters] = useState(() => defaultFilters(0, 5000000));

  const config = {
    priceMin: 0,
    priceMax: 5000000,
    priceStep: 50000,
    propertyTypes:
      category === "all" ? ["Shop Lot", "Office", "Industrial", "Land"] : undefined,
  };

  const commercial = useMemo(
    () =>
      listings.filter((l) =>
        category === "shop-lot"
          ? isShopLot(l)
          : category === "land"
            ? isLand(l)
            : isCommercial(l)
      ),
    [listings, category]
  );

  const filtered = useMemo(
    () => applyFilters(commercial, filters),
    [commercial, filters]
  );

  const crumbs = [
    { label: "Home", href: "/" },
    meta[category].crumb
      ? { label: "Commercial", href: "/commercial" }
      : { label: "Commercial" },
    ...(meta[category].crumb ? [{ label: meta[category].crumb! }] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb items={crumbs} />
      <h1 className="font-display text-3xl font-bold text-espresso md:text-4xl">
        {meta[category].title}
      </h1>
      <p className="mt-2 text-warm-grey">
        {loading ? "Loading listings…" : `${filtered.length} properties available`}
      </p>

      {/* Category sub-navigation */}
      <div className="mt-4 flex flex-wrap gap-2">
        {subNav.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              category === tab.key
                ? "bg-teal text-white"
                : "border border-teal/40 text-teal hover:bg-teal hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <FilterBar filters={filters} onChange={setFilters} config={config} />
      </div>

      <div className="mt-8">
        <ListingsResults listings={filtered} loading={loading} error={error} />
      </div>
    </div>
  );
}
