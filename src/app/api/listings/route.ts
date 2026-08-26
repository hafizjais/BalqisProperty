import { NextResponse } from "next/server";
import { fetchAllListings } from "@/lib/airtable";

// Without an explicit revalidate export, Route Handlers can get frozen on a
// stale cached response indefinitely (surviving even redeploys) instead of
// re-fetching Airtable — which serves fresh, short-lived photo URLs on every
// call. This keeps it in step with the rest of the site's 5-minute cadence.
export const revalidate = 300;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingType = searchParams.get("listingType"); // optional filter

  try {
    const listings = await fetchAllListings(listingType);
    return NextResponse.json(listings);
  } catch {
    return NextResponse.json({ error: "Listings fetch failed" }, { status: 502 });
  }
}
