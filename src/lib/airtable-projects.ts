import type { Project, ProjectUnitType } from "./types";
import {
  parseNum,
  parseBool,
  joinField,
  toList,
  attachmentUrls,
  extractMapSrc,
} from "./airtable-helpers";

// Same base + PAT as the listings table, but a separate sheet/table for
// developer projects — set AIRTABLE_PROJECT_TABLE_ID in .env.local to that
// sheet's table ID.
const PAT = process.env.AIRTABLE_PAT!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE_ID = process.env.AIRTABLE_PROJECT_TABLE_ID!;
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

// One row in the sheet = one unit type. Rows sharing the same projectId are
// grouped into a single Project for display.
function parseRow(record: any): ProjectUnitType & Omit<Project, "types" | "priceFrom" | "coverImage"> {
  const f = record.fields;

  return {
    id: String(f.id || "").trim(),
    projectId: String(f.projectId || "").trim(),
    projectName: f.projectName || "New Project — Details Coming Soon",
    developer: f.developer || "",
    projectStage: joinField(f.projectStage) || "New Launch",
    tenure: joinField(f.tenure),
    description: f.description || "",
    amenities: f.amenities
      ? String(f.amenities).split(",").map((a: string) => a.trim()).filter(Boolean)
      : [],
    area: joinField(f.area),
    areas: toList(f.area),
    city: f.city || "Johor Bahru",
    state: f.state || "Johor",
    address: f.address || "",
    mapEmbedUrl: extractMapSrc(f.mapEmbedUrl || ""),
    images: attachmentUrls(f.images),
    featured: parseBool(f.featured),
    postedDate: f.postedDate || record.createdTime || "",
    // Unit-type-specific fields — differ per row even within the same project.
    typeName: f.typeName || "",
    bedrooms: parseNum(f.bedrooms),
    bathrooms: parseNum(f.bathrooms),
    builtUpSqft: parseNum(f.builtUpSqft),
    price: parseNum(f.price) || 0,
    status: (joinField(f.status) || "available").toLowerCase(),
    floorPlan: attachmentUrls(f.floorPlan)[0] || "",
  };
}

function isRealRow(record: any): boolean {
  return Boolean(String(record.fields?.id || "").trim()) &&
    Boolean(String(record.fields?.projectId || "").trim());
}

async function fetchAllRows(): Promise<any[]> {
  let allRecords: any[] = [];
  let offset: string | null = null;

  do {
    const url = new URL(BASE_URL);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${PAT}` },
      next: { revalidate: 300 },
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

// Group unit-type rows into one Project per distinct projectId.
function groupIntoProjects(rows: ReturnType<typeof parseRow>[]): Project[] {
  const byId = new Map<string, ReturnType<typeof parseRow>[]>();
  for (const row of rows) {
    const list = byId.get(row.projectId) || [];
    list.push(row);
    byId.set(row.projectId, list);
  }

  return Array.from(byId.entries()).map(([projectId, projectRows]) => {
    const first = projectRows[0];
    const types: ProjectUnitType[] = projectRows.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      typeName: r.typeName,
      bedrooms: r.bedrooms,
      bathrooms: r.bathrooms,
      builtUpSqft: r.builtUpSqft,
      price: r.price,
      status: r.status,
      floorPlan: r.floorPlan,
      images: r.images,
    }));

    const pricesSet = types.map((t) => t.price).filter((p) => p > 0);
    const images = projectRows.flatMap((r) => r.images);

    return {
      projectId,
      projectName: first.projectName,
      developer: first.developer,
      projectStage: first.projectStage,
      tenure: first.tenure,
      description: first.description,
      amenities: first.amenities,
      area: first.area,
      areas: first.areas,
      city: first.city,
      state: first.state,
      address: first.address,
      mapEmbedUrl: first.mapEmbedUrl,
      coverImage: images[0] || "",
      images,
      priceFrom: pricesSet.length > 0 ? Math.min(...pricesSet) : 0,
      featured: projectRows.some((r) => r.featured),
      postedDate: first.postedDate,
      types,
    };
  });
}

export async function fetchAllProjects(): Promise<Project[]> {
  const records = await fetchAllRows();
  const rows = records.filter(isRealRow).map(parseRow);
  return groupIntoProjects(rows);
}

// Escape a value for safe use inside an Airtable filterByFormula string literal
function escapeFormulaValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function fetchProject(projectId: string): Promise<Project | null> {
  let decoded = projectId;
  try {
    decoded = decodeURIComponent(projectId);
  } catch {
    /* keep raw id */
  }
  decoded = decoded.trim();

  // Targeted lookup — pulls only the rows for this project's unit types,
  // not the whole sheet.
  const url = new URL(BASE_URL);
  url.searchParams.set("filterByFormula", `{projectId}="${escapeFormulaValue(decoded)}"`);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${PAT}` },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Airtable fetch failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const rows = (data.records || []).filter(isRealRow).map(parseRow);
  if (rows.length === 0) return null;

  return groupIntoProjects(rows)[0];
}
