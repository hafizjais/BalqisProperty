import { NextResponse } from "next/server";
import { fetchShoplot } from "@/lib/airtable-shoplot";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const shoplot = await fetchShoplot(params.id);
    if (!shoplot) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(shoplot);
  } catch {
    return NextResponse.json({ error: "Shoplot fetch failed" }, { status: 502 });
  }
}
