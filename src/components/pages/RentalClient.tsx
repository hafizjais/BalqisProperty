"use client";

import { useState, useMemo } from "react";
import { useRental } from "@/hooks/useRental";
import Breadcrumb from "@/components/ui/Breadcrumb";
import RentalResults from "@/components/sections/RentalResults";
import { SearchQueryReader, SearchQueryBanner } from "@/components/ui/SearchQuery";
import { matchesQuery } from "@/lib/search";

const selectCls =
  "w-full rounded-lg border border-peach bg-graphite px-3 py-2 text-sm text-espresso";

export default function RentalClient() {
  const { rental, loading, error } = useRental();
  const [type, setType] = useState("any");
  const [bedrooms, setBedrooms] = useState("any");
  const [sort, setSort] = useState("default");
  const [query, setQuery] = useState(""); // keyword from the homepage hero search (?q=)

  // Every property type currently in use — a new type added in Airtable
  // shows up here automatically, no code change needed.
  const typeOptions = useMemo(
    () => Array.from(new Set(rental.map((r) => r.type).filter(Boolean))).sort(),
    [rental]
  );

  const filtered = useMemo(() => {
    let list = rental.filter((r) => matchesQuery(query, [r.title, r.areas, r.address, r.type]));
    if (type !== "any") list = list.filter((r) => r.type === type);
    if (bedrooms !== "any") {
      list = list.filter((r) =>
        bedrooms === "5+" ? (r.bedrooms || 0) >= 5 : r.bedrooms === Number(bedrooms)
      );
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [rental, type, bedrooms, sort, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Rental" }]} />
      <h1 className="font-display text-3xl font-bold text-espresso md:text-4xl">
        Rental Properties in Johor Bahru
      </h1>
      <p className="mt-2 text-warm-grey">
        {loading ? "Loading listings…" : `${filtered.length} properties available for rent`}
      </p>
      <SearchQueryReader onChange={setQuery} />
      <SearchQueryBanner query={query} />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-warm-grey">
            Type
          </label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
            <option value="any">Any Type</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-warm-grey">
            Bedrooms
          </label>
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className={selectCls}
          >
            {["any", "1", "2", "3", "4", "5+"].map((b) => (
              <option key={b} value={b}>
                {b === "any" ? "Any" : b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-warm-grey">
            Sort
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectCls}>
            <option value="default">Default</option>
            <option value="price-asc">Price Low → High</option>
            <option value="price-desc">Price High → Low</option>
          </select>
        </div>
      </div>

      <div className="mt-8">
        <RentalResults rental={filtered} loading={loading} error={error} />
      </div>
    </div>
  );
}
