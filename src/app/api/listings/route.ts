import { NextResponse } from "next/server";
import { fetchAllListings } from "@/lib/airtable";

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
