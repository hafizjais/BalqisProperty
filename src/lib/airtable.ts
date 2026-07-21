import type { Listing } from "./types";

// Airtable Personal Access Token needs the data.records:read scope on this base.
const PAT = process.env.AIRTABLE_PAT!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE_ID = process.env.AIRTABLE_TABLE_ID!;
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

// ---------------------------------------------------------------------------
// Field helpers
// ---------------------------------------------------------------------------
const parseNum = (val: any): number | null => {
  if (val === undefined || val === null || val === "") return null;
  const num = Number(String(val).replace(/[,\s]/g, ""));
  return isNaN(num) ? null : num;
};

const parseBool = (val: any): boolean => {
  if (val === undefined || val === null) return false;
  if (typeof val === "boolean") return val;
  const str = String(val).trim().toLowerCase();
  return str === "true" || str === "1" || str === "yes" || str === "checked";
};

// Airtable multi-select fields arrive as string[]; plain text fields as string.
// Some fields (e.g. "status pemilikan") were migrated to multi-select, so this
// normalises either shape into one display string ("Freehold, Tanah Kurnia").
const joinField = (val: any): string => {
  if (Array.isArray(val)) return val.filter(Boolean).join(", ");
  return val ? String(val).trim() : "";
};

// The base has a known trailing-space duplicate on "status lot tanah" —
// some rows carry the value under the space-suffixed key. Check both.
const anyKey = (f: Record<string, any>, ...names: string[]): any => {
  for (const name of names) {
    if (f[name] !== undefined && f[name] !== "") return f[name];
  }
  return undefined;
};

// images is an Airtable attachment field: [{ url, ... }, ...].
// The first attachment is used as the card/hero cover photo.
function attachmentUrls(val: any): string[] {
  if (!Array.isArray(val)) return [];
  return val.map((a) => a?.url).filter(Boolean);
}

// mapEmbedUrl may hold a full <iframe> snippet (pasted from Google Maps
// "Embed a map") or a bare URL — extract just the src either way.
function extractMapSrc(val: string): string {
  if (!val) return "";
  const m = val.match(/src\s*=\s*"([^"]+)"/) || val.match(/src\s*=\s*'([^']+)'/);
  if (m) return m[1];
  return val.startsWith("http") ? val.trim() : "";
}

// Turn one Airtable record into a Listing.
// includeGallery controls whether the full `images` array is populated —
// list views (property cards) only ever show `coverImage`, so the bulk
// /api/listings endpoint omits the full gallery to keep payloads small.
// Only the single-listing detail page needs the complete photo set.
export function parseRecord(record: any, includeGallery = true): Listing {
  const f = record.fields;

  const fullGallery = attachmentUrls(f.images);

  return {
    id: String(f.id || "").trim(),
    // New rows often get an id before anything else is filled in — show a
    // placeholder title rather than a blank card until Balqis fills it in.
    title: f.title || "New Listing — Details Coming Soon",
    listingType: joinField(f.listingType).toLowerCase(),
    propertyType: joinField(f.propertyType).toLowerCase(),
    subType: f.subType || "",
    price: parseNum(f.price) || 0,
    bedrooms: parseNum(f.bedrooms),
    bathrooms: parseNum(f.bathrooms),
    carPark: joinField(f.carPark),
    builtUpSqft: parseNum(f.builtUpSqft),
    landSqft: joinField(f.landSqft),
    tenure: joinField(f["status pemilikan"]),
    lotStatus: joinField(anyKey(f, "status lot tanah", "status lot tanah ")),
    furnishing: f.furnishing || "",
    status: (joinField(f.status) || "available").toLowerCase(),
    featured: parseBool(f.featured),
    coverImage: fullGallery[0] || "",
    images: includeGallery ? fullGallery : [],
    amenities: f.amenities
      ? String(f.amenities).split(",").map((a: string) => a.trim()).filter(Boolean)
      : [],
    description: f.description || "",
    postedDate: f.postedDate || record.createdTime || "",
    area: f.area || "",
    city: f.city || "Johor Bahru",
    state: f.state || "Johor",
    address: f.address || "",
    mapEmbedUrl: extractMapSrc(f.mapEmbedUrl || ""),
  };
}

// Only an id is required — a row appears on the site the moment it's created
// in Airtable, even before price, photos, or a title are filled in.
function isRealRecord(record: any): boolean {
  return Boolean(String(record.fields?.id || "").trim());
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------
async function fetchAllRecords(): Promise<any[]> {
  let allRecords: any[] = [];
  let offset: string | null = null;

  // Airtable paginates at 100 records per page — loop until offset is empty
  do {
    const url = new URL(BASE_URL);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${PAT}` },
      next: { revalidate: 300 }, // cache for 5 minutes, auto-refresh
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Airtable fetch failed (${res.status}): ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    allRecords = [...allRecords, ...(data.records || [])];
    offset = data.offset || null;
  } while (offset);

  return allRecords;
}

export async function fetchAllListings(
  listingType?: string | null
): Promise<Listing[]> {
  const records = await fetchAllRecords();
  // Grid/card views only ever show coverImage — omit the full photo gallery
  // here to keep this payload small; fetchListing() below has the full set.
  let listings = records.filter(isRealRecord).map((r) => parseRecord(r, false));
  if (listingType) {
    listings = listings.filter((l) => l.listingType === listingType);
  }
  return listings;
}

// Escape a value for safe use inside an Airtable filterByFormula string literal
function escapeFormulaValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function fetchListing(id: string): Promise<Listing | null> {
  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    /* keep raw id */
  }
  decoded = decoded.trim();

  // Targeted lookup via filterByFormula — avoids downloading every record
  // (with full photo galleries) just to find the one the visitor asked for.
  const url = new URL(BASE_URL);
  url.searchParams.set("maxRecords", "1");
  url.searchParams.set("filterByFormula", `{id}="${escapeFormulaValue(decoded)}"`);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${PAT}` },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Airtable fetch failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const record = (data.records || [])[0];
  return record && isRealRecord(record) ? parseRecord(record, true) : null;
}
