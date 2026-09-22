import { NextResponse } from "next/server";
import { fetchRental } from "@/lib/airtable-rental";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rental = await fetchRental(params.id);
    if (!rental) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(rental);
  } catch {
    return NextResponse.json({ error: "Rental fetch failed" }, { status: 502 });
  }
}
