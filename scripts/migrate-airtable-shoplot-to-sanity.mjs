#!/usr/bin/env node
// One-off migration: Airtable "shop lot" table -> Sanity "shoplot" documents.
// Same column layout as the main listings table, so this reuses the exact
// same field mapping as scripts/migrate-airtable-to-sanity.mjs.
//
//   node scripts/migrate-airtable-shoplot-to-sanity.mjs            # dry run (default, no writes)
//   node scripts/migrate-airtable-shoplot-to-sanity.mjs --commit   # actually write to Sanity
//
// Safe to re-run: document IDs are deterministic (shoplot-<airtableRecordId>)
// and written with createOrReplace, and Sanity dedupes identical image uploads
// by content hash, so a second run updates in place instead of duplicating.

import { createClient } from "@sanity/client";

try {
  process.loadEnvFile(".env.local");
} catch {
  console.error("Could not read .env.local. Run this from the website repo root.");
  process.exit(1);
}

const args = new Set(process.argv.slice(2));
if (args.has("--commit") && args.has("--dry-run")) {
  console.error("Pass either --dry-run or --commit, not both.");
  process.exit(1);
}
const COMMIT = args.has("--commit");

const REQUIRED = [
  "AIRTABLE_PAT",
  "AIRTABLE_BASE_ID",
  "AIRTABLE_SHOPLOT_TABLE_ID",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "SANITY_API_VERSION",
  "SANITY_WRITE_TOKEN",
];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing env vars in .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

const AIRTABLE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_SHOPLOT_TABLE_ID}`;
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 500;

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// Values the Studio schema offers in its dropdowns. Anything else still
// migrates, but is reported so it can be cleaned up in the Studio.
const SCHEMA_LISTS = {
  listingType: ["sale", "rent", "room-rent"],
  propertyType: ["residential", "commercial", "land"],
  tenure: ["Freehold", "Leasehold", "Tanah Kurnia", "N/A"],
  lotStatus: ["Bumiputera Lot", "International Lot", "Malay Reserved", "Non Bumi Lot", "N/A"],
  furnishing: ["Fully Furnished", "Partially Furnished", "Unfurnished", "N/A"],
  status: ["available", "not available", "sold", "rented", "reserved"],
};

// ---------------------------------------------------------------------------
// Field cleaning (same rules as src/lib/airtable-helpers.ts)
// ---------------------------------------------------------------------------
const str = (val) => (val === undefined || val === null ? "" : String(val).trim());

const joinField = (val) =>
  Array.isArray(val) ? val.map(str).filter(Boolean).join(", ") : str(val);

const toList = (val) =>
  Array.isArray(val) ? val.map(str).filter(Boolean) : str(val) ? [str(val)] : [];

const parseNum = (val) => {
  if (val === undefined || val === null || val === "") return null;
  const num = Number(String(val).replace(/[,\s]/g, ""));
  return Number.isFinite(num) ? num : null;
};

const parseBool = (val) => {
  if (typeof val === "boolean") return val;
  const s = str(val).toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "checked";
};

const slugify = (code) =>
  code
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");

function extractMapSrc(val) {
  const v = str(val);
  if (!v) return "";
  if (v.includes("<iframe")) {
    const m = v.match(/src\s*=\s*"([^"]+)"/) || v.match(/src\s*=\s*'([^']+)'/);
    return m ? m[1] : "";
  }
  return v.startsWith("http") ? v : "";
}

// Airtable's postedDate is a date-only string; createdTime is a full ISO
// timestamp. Normalise both to ISO so the site's string sort stays consistent.
function toIsoDate(val) {
  const v = str(val);
  if (!v) return "";
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T00:00:00.000Z` : v);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}

// Some rows carry "status lot tanah" under a trailing-space duplicate key.
const anyKey = (f, ...names) => {
  for (const n of names) if (f[n] !== undefined && f[n] !== "") return f[n];
  return undefined;
};

// Drop empty strings, nulls and empty arrays so unset fields stay unset.
const compact = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && !v.length)
    )
  );

function mapRecord(record) {
  const f = record.fields;
  const listingCode = str(f.id);
  const attachments = Array.isArray(f.images) ? f.images.filter((a) => a?.url) : [];

  const doc = compact({
    _id: `shoplot-${record.id}`,
    _type: "shoplot",
    listingCode,
    slug: { _type: "slug", current: slugify(listingCode) },
    title: str(f.title),
    listingType: joinField(f.listingType).toLowerCase(),
    propertyType: joinField(f.propertyType).toLowerCase(),
    subType: joinField(f.subType),
    price: parseNum(f.price),
    marketValue: parseNum(f.marketValue),
    bedrooms: parseNum(f.bedrooms),
    bathrooms: parseNum(f.bathrooms),
    carPark: joinField(f.carPark),
    builtUpSqft: parseNum(f.builtUpSqft),
    landSqft: joinField(f.landSqft),
    tenure: toList(f["status pemilikan"]),
    lotStatus: toList(anyKey(f, "status lot tanah", "status lot tanah ")),
    furnishing: joinField(f.furnishing),
    status: (joinField(f.status) || "available").toLowerCase(),
    featured: parseBool(f.featured),
    description: str(f.description),
    amenities: str(f.amenities)
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean),
    areas: toList(f.area),
    city: str(f.city),
    state: str(f.state),
    address: str(f.address),
    mapEmbedUrl: extractMapSrc(f.mapEmbedUrl),
    postedDate: toIsoDate(f.postedDate) || toIsoDate(record.createdTime),
  });

  return { doc, attachments };
}

// ---------------------------------------------------------------------------
// Airtable
// ---------------------------------------------------------------------------
async function fetchAllAirtableRecords() {
  const records = [];
  let offset = null;
  do {
    const url = new URL(AIRTABLE_URL);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_PAT}` },
    });
    if (res.status === 429) {
      throw new Error(
        "Airtable returned 429 (rate or monthly API limit reached). Try again after the limit resets."
      );
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Airtable fetch failed (${res.status}): ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    records.push(...(data.records || []));
    offset = data.offset || null;
  } while (offset);
  return records;
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------
// Download each attachment immediately (Airtable URLs expire after a few
// hours) and upload it. Sanity keys image assets by content hash, so
// re-uploading an identical file returns the existing asset, not a copy.
async function uploadImages(listingCode, attachments, failedImages) {
  const images = [];
  for (const att of attachments) {
    const filename = att.filename || `${att.id || "image"}.jpg`;
    try {
      if (att.type && !att.type.startsWith("image/")) {
        throw new Error(`not an image (${att.type})`);
      }
      const res = await fetch(att.url);
      if (!res.ok) throw new Error(`download failed (${res.status})`);
      const buffer = Buffer.from(await res.arrayBuffer());
      const asset = await sanity.assets.upload("image", buffer, {
        filename,
        contentType: att.type || undefined,
      });
      images.push({
        _type: "image",
        _key: (att.id || asset._id).replace(/[^a-zA-Z0-9]/g, "").slice(-12),
        asset: { _type: "reference", _ref: asset._id },
      });
    } catch (err) {
      failedImages.push({ listingCode, filename, reason: err.message });
      console.warn(`  ! ${listingCode}: image "${filename}" skipped (${err.message})`);
    }
  }
  return images;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log(COMMIT ? "Mode: COMMIT (writing to Sanity)\n" : "Mode: DRY RUN (no writes)\n");

  console.log("Fetching Airtable records...");
  const records = await fetchAllAirtableRecords();
  console.log(`Fetched ${records.length} records.\n`);

  const noId = [];
  const stubs = [];
  const toMigrate = [];

  for (const record of records) {
    const f = record.fields || {};
    const code = str(f.id);
    if (!code) {
      noId.push(record.id);
      continue;
    }
    const hasImages = Array.isArray(f.images) && f.images.length > 0;
    if (!str(f.title) && parseNum(f.price) === null && !hasImages) {
      stubs.push(code);
      continue;
    }
    toMigrate.push(mapRecord(record));
  }

  // Duplicate listing codes would produce clashing slugs on the site.
  const bySlug = new Map();
  for (const { doc } of toMigrate) {
    const s = doc.slug.current;
    bySlug.set(s, [...(bySlug.get(s) || []), doc.listingCode]);
  }
  const duplicateSlugs = [...bySlug.entries()].filter(([, codes]) => codes.length > 1);

  // Values outside the Studio dropdown options.
  const offList = [];
  for (const { doc } of toMigrate) {
    for (const [field, allowed] of Object.entries(SCHEMA_LISTS)) {
      const values = Array.isArray(doc[field]) ? doc[field] : doc[field] ? [doc[field]] : [];
      for (const v of values) {
        if (!allowed.includes(v)) offList.push({ listingCode: doc.listingCode, field, value: v });
      }
    }
  }

  const missingRequired = toMigrate
    .filter(({ doc }) => !doc.title || doc.price === undefined || !doc.listingType)
    .map(({ doc }) => ({
      listingCode: doc.listingCode,
      missing: [!doc.title && "title", doc.price === undefined && "price", !doc.listingType && "listingType"]
        .filter(Boolean)
        .join(", "),
    }));

  const existingIds = new Set(
    await sanity.fetch(`*[_type == "shoplot" && _id in $ids]._id`, {
      ids: toMigrate.map(({ doc }) => doc._id),
    })
  );

  console.table(
    toMigrate.map(({ doc, attachments }) => ({
      action: existingIds.has(doc._id) ? "update" : "create",
      code: doc.listingCode,
      slug: doc.slug.current,
      title: (doc.title || "").slice(0, 40),
      type: doc.listingType || "",
      price: doc.price ?? "",
      images: attachments.length,
    }))
  );

  let created = 0;
  let updated = 0;
  const failedImages = [];

  if (COMMIT) {
    for (let i = 0; i < toMigrate.length; i += BATCH_SIZE) {
      const batch = toMigrate.slice(i, i + BATCH_SIZE);
      const tx = sanity.transaction();
      for (const { doc, attachments } of batch) {
        console.log(`Uploading ${attachments.length} image(s) for ${doc.listingCode}...`);
        const images = await uploadImages(doc.listingCode, attachments, failedImages);
        tx.createOrReplace(images.length ? { ...doc, images } : doc);
        existingIds.has(doc._id) ? updated++ : created++;
      }
      await tx.commit({ visibility: "async" });
      console.log(`Committed ${Math.min(i + BATCH_SIZE, toMigrate.length)}/${toMigrate.length}`);
      await sleep(BATCH_DELAY_MS);
    }
  }

  // -------------------------------------------------------------------------
  console.log("\n=== Summary ===");
  console.log(`Airtable records:        ${records.length}`);
  console.log(`To migrate:              ${toMigrate.length}`);
  console.log(`Images to migrate:       ${toMigrate.reduce((n, r) => n + r.attachments.length, 0)}`);
  if (COMMIT) {
    console.log(`Created:                 ${created}`);
    console.log(`Updated:                 ${updated}`);
    console.log(`Failed images:           ${failedImages.length}`);
  } else {
    console.log(`Would create:            ${toMigrate.filter(({ doc }) => !existingIds.has(doc._id)).length}`);
    console.log(`Would update:            ${toMigrate.filter(({ doc }) => existingIds.has(doc._id)).length}`);
  }
  console.log(`Skipped (no id):         ${noId.length}${noId.length ? `  [${noId.join(", ")}]` : ""}`);
  console.log(`Skipped stubs:           ${stubs.length}${stubs.length ? `  [${stubs.join(", ")}]` : ""}`);

  if (missingRequired.length) {
    console.log("\nMigrated, but missing required fields (fix in the Studio):");
    console.table(missingRequired);
  }
  if (duplicateSlugs.length) {
    console.log("\nDuplicate listing codes (only one will be reachable by URL):");
    for (const [slug, codes] of duplicateSlugs) console.log(`  ${slug}: ${codes.join(", ")}`);
  }
  if (offList.length) {
    console.log("\nValues not in the Studio dropdown options (migrated as-is):");
    console.table(offList);
  }
  if (failedImages.length) {
    console.log("\nFailed images:");
    console.table(failedImages);
  }
  if (!COMMIT) console.log("\nDry run only. Re-run with --commit to write.");
}

main().catch((err) => {
  console.error(`\nMigration failed: ${err.message}`);
  process.exit(1);
});
