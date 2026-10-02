import { NextResponse } from "next/server";
import { fetchAllLand } from "@/lib/land";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const land = await fetchAllLand();
    return NextResponse.json(land);
  } catch (err) {
    console.error("Land fetch failed:", err);
    return NextResponse.json({ error: "Land fetch failed" }, { status: 502 });
  }
}
