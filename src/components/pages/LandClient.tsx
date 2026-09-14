"use client";

import { useLand } from "@/hooks/useLand";
import Breadcrumb from "@/components/ui/Breadcrumb";
import LandResults from "@/components/sections/LandResults";

export default function LandClient() {
  const { land, loading, error } = useLand();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Land" }]} />
      <h1 className="font-display text-3xl font-bold text-espresso md:text-4xl">
        Land For Sale in Johor
      </h1>
      <p className="mt-2 text-warm-grey">
        {loading ? "Loading listings…" : `${land.length} properties available`}
      </p>

      <div className="mt-8">
        <LandResults land={land} loading={loading} error={error} />
      </div>
    </div>
  );
}
