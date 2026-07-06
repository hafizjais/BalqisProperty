"use client";

import { useState, useMemo } from "react";
import { useListings } from "@/hooks/useListings";
import { applyFilters, defaultFilters } from "@/lib/filters";
import Breadcrumb from "@/components/ui/Breadcrumb";
import FilterBar from "@/components/sections/FilterBar";
import ListingsResults from "@/components/sections/ListingsResults";

const config = {
  propertyTypes: ["Shophouse", "Office", "SoHo", "Industrial", "Land"],
  priceMin: 0,
  priceMax: 5000000,
  priceStep: 50000,
  showSaleOrRent: true,
};

export default function CommercialClient() {
  // Commercial spans sale + rent listings, so fetch all and filter by propertyType
  const { listings, loading, error } = useListings();
  const [filters, setFilters] = useState(() => defaultFilters(0, 5000000));

  const commercial = useMemo(
    () =>
      listings.filter(
        (l) =>
          l.propertyType.toLowerCase() === "commercial" ||
          l.listingType.toLowerCase().includes("commercial")
      ),
    [listings]
  );

  const filtered = useMemo(
    () => applyFilters(commercial, filters),
    [commercial, filters]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Commercial" }]}
      />
      <h1 className="font-display text-3xl font-bold text-espresso md:text-4xl">
        Commercial Properties in Johor Bahru
      </h1>
      <p className="mt-2 text-warm-grey">
        {loading
          ? "Loading listings…"
          : `${filtered.length} commercial properties available`}
      </p>

      <div className="mt-6">
        <FilterBar filters={filters} onChange={setFilters} config={config} />
      </div>

      <div className="mt-8">
        <ListingsResults listings={filtered} loading={loading} error={error} />
      </div>
    </div>
  );
}
