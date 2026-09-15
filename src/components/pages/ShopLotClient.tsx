"use client";

import { useState, useMemo } from "react";
import { useShoplots } from "@/hooks/useShoplots";
import { applyFilters, defaultFilters } from "@/lib/filters";
import Breadcrumb from "@/components/ui/Breadcrumb";
import FilterBar from "@/components/sections/FilterBar";
import ListingsResults from "@/components/sections/ListingsResults";

const config = {
  priceMin: 0,
  priceMax: 30000,
  priceStep: 500,
  showSaleOrRent: true,
};

export default function ShopLotClient() {
  const { shoplots, loading, error } = useShoplots();
  const [filters, setFilters] = useState(() => defaultFilters(0, 30000));

  const filtered = useMemo(() => applyFilters(shoplots, filters), [shoplots, filters]);

  // Every area currently in use across shop lot listings — a new area
  // added in Airtable shows up in the filter automatically.
  const areaOptions = useMemo(
    () => Array.from(new Set(shoplots.flatMap((l) => l.areas))).sort(),
    [shoplots]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Shop Lot" }]}
      />
      <h1 className="font-display text-3xl font-bold text-espresso md:text-4xl">
        Shop Lots For Rent/Sale in Johor
      </h1>
      <p className="mt-2 text-warm-grey">
        {loading ? "Loading listings…" : `${filtered.length} properties available`}
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
        <ListingsResults
          listings={filtered}
          loading={loading}
          error={error}
          hrefBase="/commercial/shop-lot"
        />
      </div>
    </div>
  );
}
