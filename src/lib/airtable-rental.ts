import type { RentalListing } from "./types";
import {
  parseNum,
  parseBool,
  joinField,
  toList,
  attachmentUrls,
  fetchAllAirtableRecords,
} from "./airtable-helpers";

const PAT = process.env.AIRTABLE_PAT!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE_ID = process.env.AIRTABLE_RENTAL_TABLE_ID!;
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

// There's no dedicated id column in the sheet — house_id (e.g. "House - 013")
// is the closest thing to a stable identifier, so it's slugified for the URL.
function slugify(houseId: string): string {
  return houseId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseRecord(record: any, includeGallery = true): RentalListing {
  const f = record.fields;
  const houseId = String(f.house_id || "").trim();
  const fullGallery = attachmentUrls(f.images);

  return {
    id: slugify(houseId),
    houseId,
    title: f.title || "New Rental — Details Coming Soon",
    type: f.type || "",
    status: (f.property_status || "available").toLowerCase(),
    bedrooms: parseNum(f.bedrooms),
    bathrooms: parseNum(f.bathroom),
    price: parseNum(f.price) || 0,
    area: joinField(f.area_name),
    areas: toList(f.area_name),
    city: "Johor Bahru",
    address: f.address || "",
    description: f.description || "",
    featured: parseBool(f.featured),
    coverImage: fullGallery[0] || "",
    images: includeGallery ? fullGallery : [],
    postedDate: record.createdTime || "",
  };
}

function isRealRecord(record: any): boolean {
  return Boolean(String(record.fields?.house_id || "").trim());
}

export async function fetchAllRental(): Promise<RentalListing[]> {
  const records = await fetchAllAirtableRecords(BASE_URL, PAT);
  return records.filter(isRealRecord).map((r) => parseRecord(r, false));
}

export async function fetchRental(id: string): Promise<RentalListing | null> {
  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    /* keep raw id */
  }
  decoded = decoded.trim().toLowerCase();

  // No slug column to filter by in Airtable — pull every row and match by
  // slug in code, same approach as the Project table (fine at this size).
  const records = await fetchAllAirtableRecords(BASE_URL, PAT);
  const record = records
    .filter(isRealRecord)
    .find((r) => slugify(String(r.fields.house_id || "").trim()) === decoded);

  return record ? parseRecord(record, true) : null;
}
