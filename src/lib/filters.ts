import type { Listing } from "./types";

// ---------------------------------------------------------------------------
// Listing categorisation — the site sells houses, shop lots and land.
// The sheet has no propertyType column, so categories come from subType.
// ---------------------------------------------------------------------------
const SHOP_RE = /shop|office|soho|retail|factory|warehouse|industrial/i;
const LAND_RE = /\bland\b|tanah/i;

export function isShopLot(l: Listing): boolean {
  return SHOP_RE.test(`${l.propertyType} ${l.subType}`);
}

export function isLand(l: Listing): boolean {
  return LAND_RE.test(`${l.propertyType} ${l.subType}`);
}

export function isCommercial(l: Listing): boolean {
  return (
    isShopLot(l) ||
    isLand(l) ||
    l.propertyType.toLowerCase() === "commercial"
  );
}

export interface Filters {
  areas: string[];
  propertyType: string; // "any" or a subType keyword
  priceMin: number;
  priceMax: number;
  bedrooms: string; // "any" | "1" | "2" | "3" | "4" | "5+"
  tenure: string; // "any" | "freehold" | "leasehold"
  furnishing: string; // "any" | "unfurnished" | "partially furnished" | "fully furnished"
  aircond: boolean;
  saleOrRent: string; // "any" | "sale" | "rent" (commercial page)
  sort: string; // "newest" | "price-asc" | "price-desc"
}

export function defaultFilters(priceMin: number, priceMax: number): Filters {
  return {
    areas: [],
    propertyType: "any",
    priceMin,
    priceMax,
    bedrooms: "any",
    tenure: "any",
    furnishing: "any",
    aircond: false,
    saleOrRent: "any",
    sort: "newest",
  };
}

export function applyFilters(listings: Listing[], f: Filters): Listing[] {
  const out = listings.filter((l) => {
    if (f.areas.length > 0 && !f.areas.includes(l.area)) return false;

    if (f.propertyType !== "any") {
      const hay = `${l.propertyType} ${l.subType}`.toLowerCase();
      if (!hay.includes(f.propertyType.toLowerCase())) return false;
    }

    if (l.price < f.priceMin || l.price > f.priceMax) return false;

    if (f.bedrooms !== "any") {
      const min = parseInt(f.bedrooms, 10);
      const beds = l.bedrooms ?? 0;
      if (f.bedrooms.endsWith("+")) {
        if (beds < min) return false;
      } else if (beds !== min) {
        return false;
      }
    }

    if (f.tenure !== "any") {
      // includes() so "Freehold, Tanah Kurnia" still matches "freehold"
      if (!l.tenure || !l.tenure.toLowerCase().includes(f.tenure)) return false;
    }

    if (f.furnishing !== "any") {
      if (!l.furnishing || l.furnishing.toLowerCase() !== f.furnishing) return false;
    }

    if (f.aircond) {
      const hasAC = l.amenities.some((a) => /air[\s-]?cond|\bac\b|\ba\/c\b/i.test(a));
      if (!hasAC) return false;
    }

    if (f.saleOrRent !== "any" && l.listingType !== f.saleOrRent) return false;

    return true;
  });

  if (f.sort === "price-asc") out.sort((a, b) => a.price - b.price);
  else if (f.sort === "price-desc") out.sort((a, b) => b.price - a.price);
  else out.sort((a, b) => (b.postedDate || "").localeCompare(a.postedDate || ""));

  return out;
}
