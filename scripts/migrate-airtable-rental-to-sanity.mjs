#!/usr/bin/env node
// One-off migration: Airtable "rental" table -> Sanity "rental" documents.
//
//   node scripts/migrate-airtable-rental-to-sanity.mjs            # dry run (default)
//   node scripts/migrate-airtable-rental-to-sanity.mjs --commit   # actually write to Sanity
//
// Safe to re-run: document IDs are deterministic (rental-<airtableRecordId>)
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
  "AIRTABLE_RENTAL_TABLE_ID",
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

const AIRTABLE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_RENTAL_TABLE_ID}`;
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 500;

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const SCHEMA_LISTS = { status: ["available", "not available", "rented", "reserved"] };

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

const slugify = (houseId) =>
  houseId
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const compact = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && !v.length)
    )
  );

function mapRecord(record) {
  const f = record.fields;
  const houseId = str(f.house_id);

  const doc = compact({
    _id: `rental-${record.id}`,
    _type: "rental",
    houseId,
    slug: { _type: "slug", current: slugify(houseId) },
    title: str(f.title),
    type: joinField(f.type),
    status: (joinField(f.property_status) || "available").toLowerCase(),
    bedrooms: joinField(f.bedrooms), // free text, e.g. "2+1" — kept as-is like the site does
    bathrooms: parseNum(f.bathroom),
    price: parseNum(f.price),
    description: str(f.description),
    areas: toList(f.area_name),
    city: "Johor Bahru",
    address: str(f.address),
    featured: parseBool(f.featured),
    postedDate: toIsoDate(record.createdTime),
  });

  const attachments = Array.isArray(f.images) ? f.images.filter((a) => a?.url) : [];
  return { doc, attachments };
}

function toIsoDate(val) {
  const d = new Date(val);
  return isNaN(d.getTime()) ? "" : d.toISOString();
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

async function uploadImages(houseId, attachments, failedImages) {
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
      failedImages.push({ houseId, filename, reason: err.message });
      console.warn(`  ! ${houseId}: image "${filename}" skipped (${err.message})`);
    }
  }
  return images;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log(COMMIT ? "Mode: COMMIT (writing to Sanity)\n" : "Mode: DRY RUN (no writes)\n");

  console.log("Fetching Airtable rental records...");
  const records = await fetchAllAirtableRecords();
  console.log(`Fetched ${records.length} records.\n`);

  const noId = [];
  const stubs = [];
  const toMigrate = [];

  for (const record of records) {
    const f = record.fields || {};
    const houseId = str(f.house_id);
    if (!houseId) {
      noId.push(record.id);
      continue;
    }
    const hasImages = Array.isArray(f.images) && f.images.length > 0;
    if (!str(f.title) && parseNum(f.price) === null && !hasImages) {
      stubs.push(houseId);
      continue;
    }
    toMigrate.push(mapRecord(record));
  }

  const bySlug = new Map();
  for (const { doc } of toMigrate) {
    const s = doc.slug.current;
    bySlug.set(s, [...(bySlug.get(s) || []), doc.houseId]);
  }
  const duplicateSlugs = [...bySlug.entries()].filter(([, codes]) => codes.length > 1);

  const offList = [];
  for (const { doc } of toMigrate) {
    for (const [field, allowed] of Object.entries(SCHEMA_LISTS)) {
      if (doc[field] && !allowed.includes(doc[field])) {
        offList.push({ houseId: doc.houseId, field, value: doc[field] });
      }
    }
  }

  const missingRequired = toMigrate
    .filter(({ doc }) => !doc.title || doc.price === undefined)
    .map(({ doc }) => ({
      houseId: doc.houseId,
      missing: [!doc.title && "title", doc.price === undefined && "price"].filter(Boolean).join(", "),
    }));

  const existingIds = new Set(
    await sanity.fetch(`*[_type == "rental" && _id in $ids]._id`, { ids: toMigrate.map(({ doc }) => doc._id) })
  );

  console.table(
    toMigrate.map(({ doc, attachments }) => ({
      action: existingIds.has(doc._id) ? "update" : "create",
      houseId: doc.houseId,
      slug: doc.slug.current,
      title: (doc.title || "").slice(0, 40),
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
        console.log(`Uploading ${attachments.length} image(s) for ${doc.houseId}...`);
        const images = await uploadImages(doc.houseId, attachments, failedImages);
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
  console.log(`Skipped (no house_id):   ${noId.length}${noId.length ? `  [${noId.join(", ")}]` : ""}`);
  console.log(`Skipped stubs:           ${stubs.length}${stubs.length ? `  [${stubs.join(", ")}]` : ""}`);

  if (missingRequired.length) {
    console.log("\nMigrated, but missing required fields (fix in the Studio):");
    console.table(missingRequired);
  }
  if (duplicateSlugs.length) {
    console.log("\nDuplicate house IDs (only one will be reachable by URL):");
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
