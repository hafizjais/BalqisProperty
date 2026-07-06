"use client";

import { useState, useMemo } from "react";
import { useListings } from "@/hooks/useListings";
import { applyFilters, defaultFilters } from "@/lib/filters";
import Breadcrumb from "@/components/ui/Breadcrumb";
import FilterBar from "@/components/sections/FilterBar";
import ListingsResults from "@/components/sections/ListingsResults";

const config = {
  propertyTypes: ["Terrace", "Semi-D", "Apartment", "Condo", "Townhouse"],
  priceMin: 500,
  priceMax: 5000,
  priceStep: 50,
  showBedrooms: true,
  showFurnishing: true,
};

export default function RentHouseClient() {
  const { listings, loading, error } = useListings("rent");
  const [filters, setFilters] = useState(() => defaultFilters(500, 5000));

  const filtered = useMemo(
    () => applyFilters(listings, filters),
    [listings, filters]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Rent a House" }]}
      />
      <h1 className="font-display text-3xl font-bold text-espresso md:text-4xl">
        Houses &amp; Units For Rent in Johor Bahru
      </h1>
      <p className="mt-2 text-warm-grey">
        {loading ? "Loading listings…" : `${filtered.length} listings available`}
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
