import { NextResponse } from "next/server";
import { fetchLand } from "@/lib/land";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const land = await fetchLand(params.id);
    if (!land) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(land);
  } catch (err) {
    console.error("Land fetch failed:", err);
    return NextResponse.json({ error: "Land fetch failed" }, { status: 502 });
  }
}
