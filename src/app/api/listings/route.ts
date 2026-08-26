import { NextResponse } from "next/server";
import { fetchAllListings } from "@/lib/airtable";

// Without this, Route Handlers can get frozen on a stale cached response
// indefinitely (surviving even redeploys) instead of re-fetching Airtable —
// which serves fresh, short-lived photo URLs on every call.
export const dynamic = "force-dynamic";

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
