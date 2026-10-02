import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createHash, timingSafeEqual } from "crypto";

// Called by a Sanity webhook on publish/unpublish/delete of a listing.
// The secret can be sent as an "x-revalidate-secret" header, an
// "Authorization: Bearer <secret>" header, or a ?secret= query param.
export async function POST(request: Request) {
  const expected = process.env.SANITY_REVALIDATE_SECRET;
  if (!expected) {
    console.error("SANITY_REVALIDATE_SECRET is not set");
    return NextResponse.json({ error: "Revalidation not configured" }, { status: 500 });
  }

  const provided =
    request.headers.get("x-revalidate-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    new URL(request.url).searchParams.get("secret") ||
    "";

  if (!safeEqual(provided, expected)) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  // Revalidate every known data tag unconditionally rather than branching on
  // which document type changed — revalidateTag on a tag with nothing cached
  // is a no-op, and this keeps one webhook endpoint working for every table
  // as more of them move to Sanity, with no per-table webhook config needed.
  for (const tag of ["listings", "rental", "shoplots"]) revalidateTag(tag);
  return NextResponse.json({ revalidated: true, now: Date.now() });
}

// Hash both sides first so timingSafeEqual always compares equal-length buffers.
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}
