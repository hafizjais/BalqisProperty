"use client";

import { useState, useEffect } from "react";
import type { RentalListing } from "@/lib/types";

export function useRental() {
  const [rental, setRental] = useState<RentalListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetch("/api/rental")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load rental listings");
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setRental(Array.isArray(data) ? data : []);
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

  return { rental, loading, error };
}
