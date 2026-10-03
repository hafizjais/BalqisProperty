"use client";

import { useState, useMemo } from "react";
import { useLand } from "@/hooks/useLand";
import Breadcrumb from "@/components/ui/Breadcrumb";
import LandResults from "@/components/sections/LandResults";
import { SearchQueryReader, SearchQueryBanner } from "@/components/ui/SearchQuery";
import { matchesQuery } from "@/lib/search";

export default function LandClient() {
  const { land, loading, error } = useLand();
  const [query, setQuery] = useState(""); // keyword from the homepage hero search (?q=)
  const filtered = useMemo(
    () => land.filter((l) => matchesQuery(query, [l.title, l.areas, l.mukim, l.category])),
    [land, query]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Land" }]} />
      <h1 className="font-display text-3xl font-bold text-espresso md:text-4xl">
        Land For Sale in Johor
      </h1>
      <p className="mt-2 text-warm-grey">
        {loading ? "Loading listings…" : `${filtered.length} properties available`}
      </p>
      <SearchQueryReader onChange={setQuery} />
      <SearchQueryBanner query={query} />

      <div className="mt-8">
        <LandResults land={filtered} loading={loading} error={error} />
      </div>
    </div>
  );
}
