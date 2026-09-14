import { NextResponse } from "next/server";
import { fetchAllLand } from "@/lib/airtable-land";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const land = await fetchAllLand();
    return NextResponse.json(land);
  } catch {
    return NextResponse.json({ error: "Land fetch failed" }, { status: 502 });
  }
}
