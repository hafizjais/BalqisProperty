import type { Listing } from "./types";
import * as airtable from "./airtable-shoplot";
import * as sanity from "./sanity-shoplot";

// SHOPLOT_DATA_SOURCE=sanity switches shop lots to Sanity; anything else
// keeps Airtable. Kept separate from the other tables' flags so each
// table's cutover stays independent and can be rolled back on its own.
const sanityEnabled = () => process.env.SHOPLOT_DATA_SOURCE === "sanity";

export function fetchAllShoplots(): Promise<Listing[]> {
  return sanityEnabled() ? sanity.getShoplotList() : airtable.fetchAllShoplots();
}

export function fetchShoplot(id: string): Promise<Listing | null> {
  return sanityEnabled() ? sanity.getShoplot(id) : airtable.fetchShoplot(id);
}
