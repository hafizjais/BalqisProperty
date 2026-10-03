#!/usr/bin/env node
// One-off migration: Airtable "Project" table -> Sanity "projectUnit" documents.
//
// One Airtable row = one unit type within a project. This migrates each
// row as its own Sanity document (no grouping at migration time) — the
// website groups them by projectName at read time, same as the existing
// Airtable path does.
//
//   node scripts/migrate-airtable-project-to-sanity.mjs            # dry run (default)
//   node scripts/migrate-airtable-project-to-sanity.mjs --commit   # actually write to Sanity
//
// Safe to re-run: document IDs are deterministic (projectUnit-<airtableRecordId>)
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
  "AIRTABLE_PROJECT_TABLE_ID",
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

const AIRTABLE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_PROJECT_TABLE_ID}`;
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 500;

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const SCHEMA_LISTS = { status: ["available", "sold out"] };

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

// The map embed field has been typed with different casings at different
// times in the sheet — check both, same as the existing Airtable code.
const anyKey = (f, ...names) => {
  for (const n of names) if (f[n] !== undefined && f[n] !== "") return f[n];
  return undefined;
};

// price defaults to 0 (not omitted) to match the existing "Price on
// Request" convention for a 0 value.
const compact = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([k, v]) =>
        k === "price" ||
        (v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && !v.length))
    )
  );

function mapRecord(record) {
  const f = record.fields;
  const unitId = str(f.id);
  const galleryAttachments = Array.isArray(f.gallery) ? f.gallery.filter((a) => a?.url) : [];
  const siteFloorMapAttachments = Array.isArray(f.siteFloorMap) ? f.siteFloorMap.filter((a) => a?.url) : [];
  const floorPlanAttachment = Array.isArray(f.unitPlan) ? f.unitPlan.find((a) => a?.url) : undefined;

  const doc = compact({
    _id: `projectUnit-${record.id}`,
    _type: "projectUnit",
    unitId,
    projectName: str(f.title),
    developer: str(f.Developer),
    completionYear: str(anyKey(f, "completion year", "Completion Year", "completionYear")),
    tenure: joinField(f.tenure),
    rebate: str(f.rebate),
    description: str(f.description),
    areas: toList(f.area),
    address: str(f.address),
    mapEmbedUrl: extractMapSrc(anyKey(f, "mapEmbedURL", "mapEmbedUrl")),
    featured: parseBool(f.featured),
    postedDate: toIsoDate(record.createdTime),
    typeName: str(f["type house"]),
    bedrooms: str(f.bedrooms),
    bathrooms: parseNum(f.bathrooms),
    builtUpSqft: parseNum(f.builtUpSqft),
    carPark: joinField(f.carPark),
    price: parseNum(f.price) || 0,
    status: (joinField(f.status) || "available").toLowerCase(),
  });

  return { doc, galleryAttachments, siteFloorMapAttachments, floorPlanAttachment };
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

async function uploadOneImage(unitId, att, failedImages) {
  const filename = att.filename || `${att.id || "image"}.jpg`;
  try {
    if (att.type && !att.type.startsWith("image/")) throw new Error(`not an image (${att.type})`);
    const res = await fetch(att.url);
    if (!res.ok) throw new Error(`download failed (${res.status})`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const asset = await sanity.assets.upload("image", buffer, { filename, contentType: att.type || undefined });
    return {
      _type: "image",
      _key: (att.id || asset._id).replace(/[^a-zA-Z0-9]/g, "").slice(-12),
      asset: { _type: "reference", _ref: asset._id },
    };
  } catch (err) {
    failedImages.push({ unitId, filename, reason: err.message });
    console.warn(`  ! ${unitId}: image "${filename}" skipped (${err.message})`);
    return null;
  }
}

async function uploadImages(unitId, attachments, failedImages) {
  const images = [];
  for (const att of attachments) {
    const img = await uploadOneImage(unitId, att, failedImages);
    if (img) images.push(img);
  }
  return images;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log(COMMIT ? "Mode: COMMIT (writing to Sanity)\n" : "Mode: DRY RUN (no writes)\n");

  console.log("Fetching Airtable project records...");
  const records = await fetchAllAirtableRecords();
  console.log(`Fetched ${records.length} records.\n`);

  const noId = [];
  const toMigrate = [];

  for (const record of records) {
    const f = record.fields || {};
    const unitId = str(f.id);
    const title = str(f.title);
    // Matches isRealRow() in the existing Airtable path: both id and title required.
    if (!unitId || !title) {
      noId.push(record.id);
      continue;
    }
    toMigrate.push(mapRecord(record));
  }

  const offList = [];
  for (const { doc } of toMigrate) {
    for (const [field, allowed] of Object.entries(SCHEMA_LISTS)) {
      if (doc[field] && !allowed.includes(doc[field])) {
        offList.push({ unitId: doc.unitId, field, value: doc[field] });
      }
    }
  }

  const duplicateUnitIds = [...toMigrate.reduce((map, { doc }) => {
    map.set(doc.unitId, (map.get(doc.unitId) || 0) + 1);
    return map;
  }, new Map())].filter(([, n]) => n > 1);

  const projectNames = new Set(toMigrate.map(({ doc }) => doc.projectName));

  const existingIds = new Set(
    await sanity.fetch(`*[_type == "projectUnit" && _id in $ids]._id`, {
      ids: toMigrate.map(({ doc }) => doc._id),
    })
  );

  console.table(
    toMigrate.map(({ doc, galleryAttachments, siteFloorMapAttachments, floorPlanAttachment }) => ({
      action: existingIds.has(doc._id) ? "update" : "create",
      unitId: doc.unitId,
      project: (doc.projectName || "").slice(0, 35),
      type: doc.typeName || "",
      price: doc.price,
      images:
        galleryAttachments.length + siteFloorMapAttachments.length + (floorPlanAttachment ? 1 : 0),
    }))
  );

  let created = 0;
  let updated = 0;
  const failedImages = [];

  if (COMMIT) {
    for (let i = 0; i < toMigrate.length; i += BATCH_SIZE) {
      const batch = toMigrate.slice(i, i + BATCH_SIZE);
      const tx = sanity.transaction();
      for (const { doc, galleryAttachments, siteFloorMapAttachments, floorPlanAttachment } of batch) {
        const totalImages =
          galleryAttachments.length + siteFloorMapAttachments.length + (floorPlanAttachment ? 1 : 0);
        console.log(`Uploading ${totalImages} image(s) for ${doc.unitId}...`);
        const gallery = await uploadImages(doc.unitId, galleryAttachments, failedImages);
        const siteFloorMap = await uploadImages(doc.unitId, siteFloorMapAttachments, failedImages);
        const floorPlan = floorPlanAttachment
          ? await uploadOneImage(doc.unitId, floorPlanAttachment, failedImages)
          : null;

        const fullDoc = { ...doc };
        if (gallery.length) fullDoc.gallery = gallery;
        if (siteFloorMap.length) fullDoc.siteFloorMap = siteFloorMap;
        if (floorPlan) fullDoc.floorPlan = floorPlan;

        tx.createOrReplace(fullDoc);
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
  console.log(`Distinct projects:       ${projectNames.size}`);
  console.log(
    `Images to migrate:       ${toMigrate.reduce(
      (n, r) => n + r.galleryAttachments.length + r.siteFloorMapAttachments.length + (r.floorPlanAttachment ? 1 : 0),
      0
    )}`
  );
  if (COMMIT) {
    console.log(`Created:                 ${created}`);
    console.log(`Updated:                 ${updated}`);
    console.log(`Failed images:           ${failedImages.length}`);
  } else {
    console.log(`Would create:            ${toMigrate.filter(({ doc }) => !existingIds.has(doc._id)).length}`);
    console.log(`Would update:            ${toMigrate.filter(({ doc }) => existingIds.has(doc._id)).length}`);
  }
  console.log(`Skipped (no id/title):   ${noId.length}${noId.length ? `  [${noId.join(", ")}]` : ""}`);

  if (duplicateUnitIds.length) {
    console.log("\nDuplicate unit IDs (will overwrite each other on migration):");
    for (const [id, n] of duplicateUnitIds) console.log(`  ${id}: ${n} rows`);
  }
  if (offList.length) {
    console.log("\nValues not in the Studio dropdown options (migrated as-is):");
    console.table(offList);
  }
  if (failedImages.length) {
    console.log("\nFailed images:");
    console.table(failedImages);
  }
  console.log(
    "\nReminder: projectName must be spelled identically across every unit type of the same project — review the table above for typos before relying on project grouping."
  );
  if (!COMMIT) console.log("\nDry run only. Re-run with --commit to write.");
}

main().catch((err) => {
  console.error(`\nMigration failed: ${err.message}`);
  process.exit(1);
});
