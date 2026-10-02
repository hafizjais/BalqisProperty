import { NextResponse } from "next/server";
import { fetchAllShoplots } from "@/lib/shoplot";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const shoplots = await fetchAllShoplots();
    return NextResponse.json(shoplots);
  } catch (err) {
    console.error("Shoplots fetch failed:", err);
    return NextResponse.json({ error: "Shoplots fetch failed" }, { status: 502 });
  }
}
