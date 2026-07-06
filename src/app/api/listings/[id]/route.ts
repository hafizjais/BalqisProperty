import { NextResponse } from "next/server";
import { fetchListing } from "@/lib/sheets";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await fetchListing(params.id);
    if (!listing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(listing);
  } catch {
    return NextResponse.json({ error: "Listings fetch failed" }, { status: 502 });
  }
}
