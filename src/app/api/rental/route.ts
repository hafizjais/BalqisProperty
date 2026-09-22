import { NextResponse } from "next/server";
import { fetchAllRental } from "@/lib/airtable-rental";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rental = await fetchAllRental();
    return NextResponse.json(rental);
  } catch {
    return NextResponse.json({ error: "Rental fetch failed" }, { status: 502 });
  }
}
