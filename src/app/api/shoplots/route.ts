import { NextResponse } from "next/server";
import { fetchAllShoplots } from "@/lib/airtable-shoplot";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const shoplots = await fetchAllShoplots();
    return NextResponse.json(shoplots);
  } catch {
    return NextResponse.json({ error: "Shoplots fetch failed" }, { status: 502 });
  }
}
