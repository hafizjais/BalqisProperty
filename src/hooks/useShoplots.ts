"use client";

import { useState, useEffect } from "react";
import type { Listing } from "@/lib/types";

export function useShoplots() {
  const [shoplots, setShoplots] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetch("/api/shoplots")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load shop lots");
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setShoplots(Array.isArray(data) ? data : []);
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

  return { shoplots, loading, error };
}
