"use client";

import { useState, useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import { useListings } from "@/hooks/useListings";
import { applyFilters, defaultFilters } from "@/lib/filters";
import Breadcrumb from "@/components/ui/Breadcrumb";
import FilterBar from "@/components/sections/FilterBar";
import ListingsResults from "@/components/sections/ListingsResults";

const config = {
  priceMin: 200,
  priceMax: 1500,
  priceStep: 25,
  showFurnishing: true,
  showAircond: true,
};

export default function RentRoomClient() {
  const { listings, loading, error } = useListings("room-rent");
  const [filters, setFilters] = useState(() => defaultFilters(200, 1500));

  const filtered = useMemo(
    () => applyFilters(listings, filters),
    [listings, filters]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Rent a Room" }]}
      />
      <h1 className="font-display text-3xl font-bold text-espresso md:text-4xl">
        Rooms For Rent in Johor Bahru
      </h1>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border-l-4 border-copper bg-sand p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-copper" aria-hidden />
        <p className="text-sm text-espresso">
          All rooms are in verified, well-maintained houses managed by BalqisMJ
          Property.
        </p>
      </div>

      <p className="mt-4 text-warm-grey">
        {loading ? "Loading listings…" : `${filtered.length} rooms available`}
      </p>

      <div className="mt-4">
        <FilterBar filters={filters} onChange={setFilters} config={config} />
      </div>

      <div className="mt-8">
        <ListingsResults listings={filtered} loading={loading} error={error} />
      </div>
    </div>
  );
}
