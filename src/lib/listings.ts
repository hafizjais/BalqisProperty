import type { Listing } from "./types";
import * as airtable from "./airtable";
import * as sanity from "./sanity";

// DATA_SOURCE=sanity switches the main listings to Sanity; anything else
// (including unset) keeps Airtable. Flip it on Vercel to cut over or roll
// back without a code change.
const sanityEnabled = () => process.env.DATA_SOURCE === "sanity";

export function fetchAllListings(listingType?: string | null): Promise<Listing[]> {
  return sanityEnabled() ? sanity.getListings(listingType) : airtable.fetchAllListings(listingType);
}

export function fetchListing(id: string): Promise<Listing | null> {
  return sanityEnabled() ? sanity.getListing(id) : airtable.fetchListing(id);
}
