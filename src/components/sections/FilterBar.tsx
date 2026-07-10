"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { JB_AREAS, formatRM } from "@/lib/constants";
import type { Filters } from "@/lib/filters";

export interface FilterConfig {
  propertyTypes?: string[];
  priceMin: number;
  priceMax: number;
  priceStep: number;
  showBedrooms?: boolean;
  showTenure?: boolean;
  showFurnishing?: boolean;
  showAircond?: boolean;
  showSaleOrRent?: boolean;
}

const selectCls =
  "w-full rounded-lg border border-peach bg-graphite px-3 py-2 text-sm text-espresso";

export default function FilterBar({
  filters,
  onChange,
  config,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  config: FilterConfig;
}) {
  const [areasOpen, setAreasOpen] = useState(false);
  const areasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (areasRef.current && !areasRef.current.contains(e.target as Node)) {
        setAreasOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  const toggleArea = (area: string) => {
    const areas = filters.areas.includes(area)
      ? filters.areas.filter((a) => a !== area)
      : [...filters.areas, area];
    set({ areas });
  };

  const reset = () =>
    onChange({
      areas: [],
      propertyType: "any",
      priceMin: config.priceMin,
      priceMax: config.priceMax,
      bedrooms: "any",
      tenure: "any",
      furnishing: "any",
      aircond: false,
      saleOrRent: "any",
      sort: "newest",
    });

  return (
    <div className="sticky top-16 z-30 -mx-4 border-b border-peach bg-cream/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="mx-auto grid max-w-7xl grid-cols-2 items-end gap-3 md:grid-cols-3 lg:grid-cols-6">
        {/* Area multi-select */}
        <div ref={areasRef} className="relative col-span-2 md:col-span-1">
          <label className="mb-1 block text-xs font-semibold text-warm-grey">
            Area
          </label>
          <button
            type="button"
            onClick={() => setAreasOpen(!areasOpen)}
            aria-expanded={areasOpen}
            className={`${selectCls} flex items-center justify-between text-left`}
          >
            <span className="truncate">
              {filters.areas.length === 0
                ? "All Areas"
                : `${filters.areas.length} selected`}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-warm-grey" aria-hidden />
          </button>
          {areasOpen && (
            <div className="absolute z-40 mt-1 max-h-64 w-64 overflow-auto rounded-xl border border-peach bg-graphite p-2 shadow-card-hover">
              {JB_AREAS.map((area) => (
                <label
                  key={area}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-cream"
                >
                  <input
                    type="checkbox"
                    checked={filters.areas.includes(area)}
                    onChange={() => toggleArea(area)}
                    className="accent-copper"
                  />
                  {area}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Property type */}
        {config.propertyTypes && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-warm-grey">
              Type
            </label>
            <select
              value={filters.propertyType}
              onChange={(e) => set({ propertyType: e.target.value })}
              className={selectCls}
            >
              <option value="any">Any Type</option>
              {config.propertyTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price range sliders */}
        <div className="col-span-2 md:col-span-1">
          <label className="mb-1 block text-xs font-semibold text-warm-grey">
            Price: {formatRM(filters.priceMin)} – {formatRM(filters.priceMax)}
          </label>
          <div className="space-y-1 rounded-lg border border-peach bg-graphite px-3 py-1.5">
            <input
              type="range"
              min={config.priceMin}
              max={config.priceMax}
              step={config.priceStep}
              value={filters.priceMin}
              onChange={(e) =>
                set({ priceMin: Math.min(Number(e.target.value), filters.priceMax) })
              }
              aria-label="Minimum price"
              className="w-full"
            />
            <input
              type="range"
              min={config.priceMin}
              max={config.priceMax}
              step={config.priceStep}
              value={filters.priceMax}
              onChange={(e) =>
                set({ priceMax: Math.max(Number(e.target.value), filters.priceMin) })
              }
              aria-label="Maximum price"
              className="w-full"
            />
          </div>
        </div>

        {config.showBedrooms && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-warm-grey">
              Bedrooms
            </label>
            <select
              value={filters.bedrooms}
              onChange={(e) => set({ bedrooms: e.target.value })}
              className={selectCls}
            >
              {["any", "1", "2", "3", "4", "5+"].map((b) => (
                <option key={b} value={b}>
                  {b === "any" ? "Any" : b}
                </option>
              ))}
            </select>
          </div>
        )}

        {config.showTenure && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-warm-grey">
              Tenure
            </label>
            <select
              value={filters.tenure}
              onChange={(e) => set({ tenure: e.target.value })}
              className={selectCls}
            >
              <option value="any">Any</option>
              <option value="freehold">Freehold</option>
              <option value="leasehold">Leasehold</option>
            </select>
          </div>
        )}

        {config.showFurnishing && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-warm-grey">
              Furnishing
            </label>
            <select
              value={filters.furnishing}
              onChange={(e) => set({ furnishing: e.target.value })}
              className={selectCls}
            >
              <option value="any">Any</option>
              <option value="unfurnished">Unfurnished</option>
              <option value="partially furnished">Partially Furnished</option>
              <option value="fully furnished">Fully Furnished</option>
            </select>
          </div>
        )}

        {config.showSaleOrRent && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-warm-grey">
              Listing Type
            </label>
            <select
              value={filters.saleOrRent}
              onChange={(e) => set({ saleOrRent: e.target.value })}
              className={selectCls}
            >
              <option value="any">Sale &amp; Rent</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
        )}

        {config.showAircond && (
          <div className="flex items-center gap-2 pb-2">
            <input
              id="aircond"
              type="checkbox"
              checked={filters.aircond}
              onChange={(e) => set({ aircond: e.target.checked })}
              className="h-4 w-4 accent-copper"
            />
            <label htmlFor="aircond" className="text-sm text-espresso">
              Air-Conditioning
            </label>
          </div>
        )}

        {/* Sort + reset */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold text-warm-grey">
              Sort
            </label>
            <select
              value={filters.sort}
              onChange={(e) => set({ sort: e.target.value })}
              className={selectCls}
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price Low → High</option>
              <option value="price-desc">Price High → Low</option>
            </select>
          </div>
          <button
            type="button"
            onClick={reset}
            aria-label="Reset filters"
            title="Reset filters"
            className="rounded-lg border border-peach bg-graphite p-2.5 text-warm-grey hover:text-copper"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
