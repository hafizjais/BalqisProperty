#!/usr/bin/env node
// One-off migration: Airtable "Land" table -> Sanity "land" documents.
//
//   node scripts/migrate-airtable-land-to-sanity.mjs            # dry run (default)
//   node scripts/migrate-airtable-land-to-sanity.mjs --commit   # actually write to Sanity
//
// Unlike listing/rental/shoplot, the site does NOT slugify the land ID for
// URLs — it uses the raw landId directly as the page URL and lookup key, so
// there's no slug here, and duplicate-landId detection is just duplicate
// landId values (not a separate slug collision).
//
// Safe to re-run: document IDs are deterministic (land-<airtableRecordId>)
// and written with createOrReplace, images dedupe by content hash.

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
  "AIRTABLE_LAND_TABLE_ID",
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

const AIRTABLE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_LAND_TABLE_ID}`;
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 500;

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const SCHEMA_LISTS = {
  lotStatus: ["International Lot", "Non Bumi Lot", "Rezab Melayu", "Bumiputera Lot", "Malay Reserved", "N/A"],
  status: ["available", "not available", "sold"],
};

// ---------------------------------------------------------------------------
const str = (val) => (val === undefined || val === null ? "" : String(val).trim());
const joinField = (val) => (Array.isArray(val) ? val.map(str).filter(Boolean).join(", ") : str(val));
const toList = (val) => (Array.isArray(val) ? val.map(str).filter(Boolean) : str(val) ? [str(val)] : []);

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

function extractMapSrc(val) {
  const v = str(val);
  if (!v) return "";
  if (v.includes("<iframe")) {
    const m = v.match(/src\s*=\s*"([^"]+)"/) || v.match(/src\s*=\s*'([^']+)'/);
    return m ? m[1] : "";
  }
  return v.startsWith("http") ? v : "";
}

function toIsoDate(val) {
  const d = new Date(val);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}

// Only landId, title and description are allowed to be empty-stripped;
// marketValue defaults to 0 (not omitted) to match the existing site's
// "Price on Request" convention for a 0 value.
const compact = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([k, v]) =>
        k === "marketValue" ||
        (v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && !v.length))
    )
  );

function mapRecord(record) {
  const f = record.fields;
  const landId = str(f.land_id);

  const doc = compact({
    _id: `land-${record.id}`,
    _type: "land",
    landId,
    title: str(f.land_title),
    category: str(f.land_category),
    lotStatus: str(f.land_lot_status),
    ownership: toList(f.ownership_status),
    rezabTanah: str(f.rezab_tanah),
    status: (str(f.property_status) || "available").toLowerCase(),
    mukim: str(f.mukim),
    areas: toList(f.area_name),
    city: str(f.city) || "Johor Bahru",
    acres: parseNum(f.land_area_acres),
    buildUpSqft: parseNum(f.buildup_sqft),
    marketValue: parseNum(f.market_value) || 0,
    description: str(f.description),
    mapEmbedUrl: extractMapSrc(f.mapEmbedUrl),
    featured: parseBool(f.featured),
    postedDate: toIsoDate(record.createdTime),
  });

  const attachments = Array.isArray(f.images) ? f.images.filter((a) => a?.url) : [];
  return { doc, attachments };
}

// ---------------------------------------------------------------------------
async function fetchAllAirtableRecords() {
  const records = [];
  let offset = null;
  do {
    const url = new URL(AIRTABLE_URL);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.AIRTABLE_PAT}` } });
    if (res.status === 429) {
      throw new Error("Airtable returned 429 (rate or monthly API limit reached). Try again after the limit resets.");
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

async function uploadImages(landId, attachments, failedImages) {
  const images = [];
  for (const att of attachments) {
    const filename = att.filename || `${att.id || "image"}.jpg`;
    try {
      if (att.type && !att.type.startsWith("image/")) throw new Error(`not an image (${att.type})`);
      const res = await fetch(att.url);
      if (!res.ok) throw new Error(`download failed (${res.status})`);
      const buffer = Buffer.from(await res.arrayBuffer());
      const asset = await sanity.assets.upload("image", buffer, { filename, contentType: att.type || undefined });
      images.push({
        _type: "image",
        _key: (att.id || asset._id).replace(/[^a-zA-Z0-9]/g, "").slice(-12),
        asset: { _type: "reference", _ref: asset._id },
      });
    } catch (err) {
      failedImages.push({ landId, filename, reason: err.message });
      console.warn(`  ! ${landId}: image "${filename}" skipped (${err.message})`);
    }
  }
  return images;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log(COMMIT ? "Mode: COMMIT (writing to Sanity)\n" : "Mode: DRY RUN (no writes)\n");

  console.log("Fetching Airtable land records...");
  const records = await fetchAllAirtableRecords();
  console.log(`Fetched ${records.length} records.\n`);

  const noId = [];
  const stubs = [];
  const toMigrate = [];

  for (const record of records) {
    const f = record.fields || {};
    const landId = str(f.land_id);
    if (!landId) {
      noId.push(record.id);
      continue;
    }
    const hasImages = Array.isArray(f.images) && f.images.length > 0;
    if (!str(f.land_title) && parseNum(f.market_value) === null && !hasImages) {
      stubs.push(landId);
      continue;
    }
    toMigrate.push(mapRecord(record));
  }

  const byLandId = new Map();
  for (const { doc } of toMigrate) {
    byLandId.set(doc.landId, [...(byLandId.get(doc.landId) || []), doc._id]);
  }
  const duplicates = [...byLandId.entries()].filter(([, ids]) => ids.length > 1);

  const offList = [];
  for (const { doc } of toMigrate) {
    for (const [field, allowed] of Object.entries(SCHEMA_LISTS)) {
      if (doc[field] && !allowed.includes(doc[field])) {
        offList.push({ landId: doc.landId, field, value: doc[field] });
      }
    }
  }

  const missingRequired = toMigrate
    .filter(({ doc }) => !doc.title)
    .map(({ doc }) => ({ landId: doc.landId, missing: "title" }));

  const existingIds = new Set(
    await sanity.fetch(`*[_type == "land" && _id in $ids]._id`, { ids: toMigrate.map(({ doc }) => doc._id) })
  );

  console.table(
    toMigrate.map(({ doc, attachments }) => ({
      action: existingIds.has(doc._id) ? "update" : "create",
      landId: doc.landId,
      title: (doc.title || "").slice(0, 40),
      marketValue: doc.marketValue,
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
        console.log(`Uploading ${attachments.length} image(s) for ${doc.landId}...`);
        const images = await uploadImages(doc.landId, attachments, failedImages);
        tx.createOrReplace(images.length ? { ...doc, images } : doc);
        existingIds.has(doc._id) ? updated++ : created++;
      }
      await tx.commit({ visibility: "async" });
      console.log(`Committed ${Math.min(i + BATCH_SIZE, toMigrate.length)}/${toMigrate.length}`);
      await sleep(BATCH_DELAY_MS);
    }
  }

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
  console.log(`Skipped (no land_id):    ${noId.length}${noId.length ? `  [${noId.join(", ")}]` : ""}`);
  console.log(`Skipped stubs:           ${stubs.length}${stubs.length ? `  [${stubs.join(", ")}]` : ""}`);

  if (missingRequired.length) {
    console.log("\nMigrated, but missing a title (fix in the Studio):");
    console.table(missingRequired);
  }
  if (duplicates.length) {
    console.log("\nDuplicate land IDs (only one will be reachable by URL):");
    for (const [id, docIds] of duplicates) console.log(`  ${id}: ${docIds.join(", ")}`);
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
