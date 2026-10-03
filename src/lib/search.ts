// Keyword search shared by the hero search bar and every listings page.
// A listing matches when every word of the query appears somewhere in the
// given fields (case- and punctuation-insensitive), so "pasir gudang" and
// "Pasir-Gudang" both match an area of "Pasir Gudang".

type Field = string | string[] | null | undefined;

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function matchesQuery(query: string, fields: Field[]): boolean {
  const q = normalize(query);
  if (!q) return true;
  const haystack = normalize(fields.flat().filter(Boolean).join(" "));
  return q.split(" ").every((word) => haystack.includes(word));
}

// Where each hero search tab sends the visitor.
export const SEARCH_CATEGORIES = [
  { key: "subsale", label: "Subsale", href: "/subsale" },
  { key: "rental", label: "Rental", href: "/rental" },
  { key: "project", label: "New Project", href: "/project" },
  { key: "shoplot", label: "Shop Lot", href: "/commercial/shop-lot" },
  { key: "land", label: "Land", href: "/commercial/land" },
] as const;

export type SearchCategory = (typeof SEARCH_CATEGORIES)[number]["key"];

export function searchHref(category: SearchCategory, query: string): string {
  const base = SEARCH_CATEGORIES.find((c) => c.key === category)!.href;
  const q = query.trim();
  return q ? `${base}?q=${encodeURIComponent(q)}` : base;
}
