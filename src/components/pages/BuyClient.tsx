"use client";

import { useState, useMemo } from "react";
import { Calculator, ChevronDown } from "lucide-react";
import { useListings } from "@/hooks/useListings";
import { applyFilters, defaultFilters, isCommercial } from "@/lib/filters";
import Breadcrumb from "@/components/ui/Breadcrumb";
import FilterBar from "@/components/sections/FilterBar";
import ListingsResults from "@/components/sections/ListingsResults";
import CalculatorTabs from "@/components/calculators/CalculatorTabs";

const config = {
  propertyTypes: ["Terrace", "Single Storey", "Double Storey", "Bungalow", "Apartment", "Service Apartment"],
  priceMin: 100000,
  priceMax: 5000000,
  priceStep: 50000,
  showBedrooms: true,
  showTenure: true,
};

export default function BuyClient() {
  const { listings, loading, error } = useListings("sale");
  const [filters, setFilters] = useState(() => defaultFilters(100000, 5000000));
  const [calcOpen, setCalcOpen] = useState(false);

  // Shop lots and land live under /commercial — Buy shows homes only
  const filtered = useMemo(
    () => applyFilters(listings.filter((l) => !isCommercial(l)), filters),
    [listings, filters]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Buy Property" }]}
      />
      <h1 className="font-display text-3xl font-bold text-espresso md:text-4xl">
        Properties For Sale in Johor Bahru
      </h1>
      <p className="mt-2 text-warm-grey">
        {loading ? "Loading listings…" : `${filtered.length} listings available`}
      </p>

      <div className="mt-6">
        <FilterBar filters={filters} onChange={setFilters} config={config} />
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        {/* Calculators — collapsible accordion on top for mobile; on desktop a
            sticky right column that scrolls inside itself if taller than the screen */}
        <aside className="nice-scroll lg:sticky lg:top-40 lg:order-2 lg:max-h-[calc(100vh-11.5rem)] lg:overflow-y-auto lg:rounded-2xl">
          <button
            type="button"
            onClick={() => setCalcOpen(!calcOpen)}
            aria-expanded={calcOpen}
            className="flex w-full items-center justify-between rounded-xl bg-mocha px-4 py-3.5 text-sm font-semibold text-white lg:hidden"
          >
            <span className="flex items-center gap-2">
              <Calculator className="h-4 w-4" aria-hidden />
              Property Calculators
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${calcOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
          <div className={`mt-3 lg:mt-0 ${calcOpen ? "block" : "hidden"} lg:block`}>
            <CalculatorTabs />
          </div>
        </aside>

        <section className="lg:order-1" aria-label="Listings for sale">
          <ListingsResults
            listings={filtered}
            loading={loading}
            error={error}
            columns="sm:grid-cols-2"
          />
        </section>
      </div>
    </div>
  );
}
