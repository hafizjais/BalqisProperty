"use client";

import { useState, useMemo } from "react";
import { useListings } from "@/hooks/useListings";
import { applyFilters, defaultFilters, isCommercial } from "@/lib/filters";
import Breadcrumb from "@/components/ui/Breadcrumb";
import FilterBar from "@/components/sections/FilterBar";
import ListingsResults from "@/components/sections/ListingsResults";

const config = {
  propertyTypes: ["Terrace", "Single Storey", "Double Storey", "Bungalow", "Apartment", "Service Apartment"],
  priceMin: 100000,
  priceMax: 5000000,
  priceStep: 50000,
  showBedrooms: true,
  showTenure: true,
};

export default function SubsaleClient() {
  const { listings, loading, error } = useListings("sale");
  const [filters, setFilters] = useState(() => defaultFilters(100000, 5000000));

  // Shop lots and land live under /commercial — Subsale shows homes only
  const filtered = useMemo(
    () => applyFilters(listings.filter((l) => !isCommercial(l)), filters),
    [listings, filters]
  );

  // Every area currently in use across listings — a new area added in
  // Airtable shows up in the filter automatically, no code change needed.
  const areaOptions = useMemo(
    () => Array.from(new Set(listings.flatMap((l) => l.areas))).sort(),
    [listings]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Subsale Property" }]}
      />
      <h1 className="font-display text-3xl font-bold text-espresso md:text-4xl">
        Subsale Properties in Johor Bahru
      </h1>
      <p className="mt-2 text-warm-grey">
        {loading ? "Loading listings…" : `${filtered.length} listings available`}
      </p>

      <div className="mt-6">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          config={config}
          areaOptions={areaOptions}
        />
      </div>

      <div className="mt-8">
        <ListingsResults listings={filtered} loading={loading} error={error} />
      </div>
    </div>
  );
}
