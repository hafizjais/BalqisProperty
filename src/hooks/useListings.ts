"use client";

import { useState, useEffect } from "react";
import type { Listing } from "@/lib/types";

export function useListings(listingType?: string) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = listingType
      ? `/api/listings?listingType=${listingType}`
      : "/api/listings";

    setLoading(true);
    setError(null);

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load listings");
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setListings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [listingType]);

  return { listings, loading, error };
}
