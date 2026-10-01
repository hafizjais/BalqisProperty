import type { RentalListing } from "./types";
import * as airtable from "./airtable-rental";
import * as sanity from "./sanity-rental";

// RENTAL_DATA_SOURCE=sanity switches rental to Sanity; anything else keeps
// Airtable. Kept separate from the main listings' DATA_SOURCE so each
// table's cutover stays independent and can be rolled back on its own.
const sanityEnabled = () => process.env.RENTAL_DATA_SOURCE === "sanity";

export function fetchAllRental(): Promise<RentalListing[]> {
  return sanityEnabled() ? sanity.getRentalList() : airtable.fetchAllRental();
}

export function fetchRental(id: string): Promise<RentalListing | null> {
  return sanityEnabled() ? sanity.getRental(id) : airtable.fetchRental(id);
}
