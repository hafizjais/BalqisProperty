import type { LandListing } from "./types";
import * as airtable from "./airtable-land";
import * as sanity from "./sanity-land";

// LAND_DATA_SOURCE=sanity switches land to Sanity; anything else keeps
// Airtable. Kept separate from the other tables' flags so each table's
// cutover stays independent and can be rolled back on its own.
const sanityEnabled = () => process.env.LAND_DATA_SOURCE === "sanity";

export function fetchAllLand(): Promise<LandListing[]> {
  return sanityEnabled() ? sanity.getLandList() : airtable.fetchAllLand();
}

export function fetchLand(id: string): Promise<LandListing | null> {
  return sanityEnabled() ? sanity.getLand(id) : airtable.fetchLand(id);
}
