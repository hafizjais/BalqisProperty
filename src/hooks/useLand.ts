"use client";

import { useState, useEffect } from "react";
import type { LandListing } from "@/lib/types";

export function useLand() {
  const [land, setLand] = useState<LandListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetch("/api/land")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load land listings");
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setLand(Array.isArray(data) ? data : []);
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
  }, []);

  return { land, loading, error };
}
