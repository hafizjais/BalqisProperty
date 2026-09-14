import type { LandListing } from "./types";
import {
  parseNum,
  parseBool,
  joinField,
  toList,
  attachmentUrls,
  extractMapSrc,
  fetchAllAirtableRecords,
  escapeFormulaValue,
} from "./airtable-helpers";

const PAT = process.env.AIRTABLE_PAT!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE_ID = process.env.AIRTABLE_LAND_TABLE_ID!;
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

function parseRecord(record: any, includeGallery = true): LandListing {
  const f = record.fields;
  const fullGallery = attachmentUrls(f.images);

  return {
    id: String(f.land_id || "").trim(),
    title: f.land_title || "New Land Listing — Details Coming Soon",
    category: f.land_category || "",
    lotStatus: f.land_lot_status || "",
    ownership: joinField(f.ownership_status),
    rezabTanah: f.rezab_tanah || "",
    status: (f.property_status || "available").toLowerCase(),
    mukim: f.mukim || "",
    area: joinField(f.area_name),
    areas: toList(f.area_name),
    city: f.city || "Johor Bahru",
    acres: parseNum(f.land_area_acres),
    buildUpSqft: parseNum(f.buildup_sqft),
    marketValue: parseNum(f.market_value) || 0,
    featured: parseBool(f.featured),
    coverImage: fullGallery[0] || "",
    images: includeGallery ? fullGallery : [],
    description: f.description || "",
    postedDate: record.createdTime || "",
    mapEmbedUrl: extractMapSrc(f.mapEmbedUrl || ""),
  };
}

function isRealRecord(record: any): boolean {
  return Boolean(String(record.fields?.land_id || "").trim());
}

export async function fetchAllLand(): Promise<LandListing[]> {
  const records = await fetchAllAirtableRecords(BASE_URL, PAT);
  return records.filter(isRealRecord).map((r) => parseRecord(r, false));
}

export async function fetchLand(id: string): Promise<LandListing | null> {
  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    /* keep raw id */
  }
  decoded = decoded.trim();

  const url = new URL(BASE_URL);
  url.searchParams.set("maxRecords", "1");
  url.searchParams.set("filterByFormula", `{land_id}="${escapeFormulaValue(decoded)}"`);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${PAT}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Airtable fetch failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const record = (data.records || [])[0];
  return record && isRealRecord(record) ? parseRecord(record, true) : null;
}
