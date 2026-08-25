import type { Project, ProjectUnitType } from "./types";
import { parseNum, parseBool, joinField, toList, attachmentUrls, extractMapSrc } from "./airtable-helpers";

// Same base + PAT as the listings table, but a separate sheet/table for
// developer projects — set AIRTABLE_PROJECT_TABLE_ID in .env.local to that
// sheet's table ID.
const PAT = process.env.AIRTABLE_PAT!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE_ID = process.env.AIRTABLE_PROJECT_TABLE_ID!;
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

// The map embed field has been typed with a couple of different casings in
// the sheet at different times — check both.
const anyKey = (f: Record<string, any>, ...names: string[]): any => {
  for (const name of names) {
    if (f[name] !== undefined && f[name] !== "") return f[name];
  }
  return undefined;
};

// Turn a project name into a URL-safe slug used as the route param
// (e.g. "Monterra Johor Bahru" -> "monterra-johor-bahru"). There's no
// separate project-code column in the sheet, so the project name itself
// (the `title` field) is the grouping key.
function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface RawRow {
  id: string;
  projectName: string;
  slug: string;
  developer: string;
  tenure: string;
  description: string;
  area: string;
  areas: string[];
  address: string;
  mapEmbedUrl: string;
  siteFloorMap: string[];
  gallery: string[];
  featured: boolean;
  postedDate: string;
  typeName: string;
  bedrooms: string;
  bathrooms: number | null;
  builtUpSqft: number | null;
  carPark: string;
  price: number;
  status: string;
  floorPlan: string;
}

// One row in the sheet = one unit type. Rows sharing the same project name
// (`title`) are grouped into a single Project for display.
function parseRow(record: any): RawRow {
  const f = record.fields;
  const projectName = f.title || "New Project — Details Coming Soon";

  return {
    id: String(f.id || "").trim(),
    projectName,
    slug: slugify(projectName),
    developer: f.Developer || "",
    tenure: joinField(f.tenure),
    description: f.description || "",
    area: joinField(f.area),
    areas: toList(f.area),
    address: f.address || "",
    mapEmbedUrl: extractMapSrc(anyKey(f, "mapEmbedURL", "mapEmbedUrl") || ""),
    siteFloorMap: attachmentUrls(f.siteFloorMap),
    gallery: attachmentUrls(f.gallery),
    featured: parseBool(f.featured),
    postedDate: record.createdTime || "",
    // Unit-type-specific fields — differ per row even within the same project.
    typeName: (f["type house"] || "").trim(),
    bedrooms: f.bedrooms !== undefined && f.bedrooms !== null ? String(f.bedrooms).trim() : "",
    bathrooms: parseNum(f.bathrooms),
    builtUpSqft: parseNum(f.builtUpSqft),
    carPark: joinField(f.carPark),
    price: parseNum(f.price) || 0,
    status: (joinField(f.status) || "available").toLowerCase(),
    floorPlan: attachmentUrls(f.unitPlan)[0] || "",
  };
}

function isRealRow(record: any): boolean {
  return Boolean(String(record.fields?.id || "").trim()) &&
    Boolean(String(record.fields?.title || "").trim());
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

// Group unit-type rows into one Project per distinct project slug.
function groupIntoProjects(rows: RawRow[]): Project[] {
  const bySlug = new Map<string, RawRow[]>();
  for (const row of rows) {
    const list = bySlug.get(row.slug) || [];
    list.push(row);
    bySlug.set(row.slug, list);
  }

  return Array.from(bySlug.entries()).map(([slug, projectRows]) => {
    const first = projectRows[0];
    const types: ProjectUnitType[] = projectRows.map((r) => ({
      id: r.id,
      typeName: r.typeName,
      bedrooms: r.bedrooms,
      bathrooms: r.bathrooms,
      builtUpSqft: r.builtUpSqft,
      carPark: r.carPark,
      price: r.price,
      status: r.status,
      floorPlan: r.floorPlan,
    }));

    // Smallest/cheapest unit type first — a natural browsing order for a catalog.
    types.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));

    const prices = types.map((t) => t.price).filter((p) => p > 0);
    // Every site plan photo across this project's rows, deduplicated.
    const siteFloorMap = Array.from(new Set(projectRows.flatMap((r) => r.siteFloorMap)));
    // Prefer real project photos; fall back to floor plan / site plan
    // images so a card never shows a blank placeholder unnecessarily.
    const gallery = projectRows.flatMap((r) => r.gallery);
    const fallbackImages = [
      ...siteFloorMap,
      ...types.map((t) => t.floorPlan).filter(Boolean),
    ];
    const images = gallery.length > 0 ? gallery : fallbackImages;

    return {
      projectId: slug,
      projectName: first.projectName,
      developer: first.developer,
      projectStage: "",
      tenure: first.tenure,
      description: first.description,
      area: first.area,
      areas: first.areas,
      city: "Johor Bahru",
      state: "Johor",
      address: first.address,
      mapEmbedUrl: first.mapEmbedUrl,
      siteFloorMap,
      coverImage: images[0] || "",
      images,
      priceFrom: prices.length > 0 ? Math.min(...prices) : 0,
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

// There's no slug column in Airtable to filter by, so this pulls every row
// and matches by slug in code — fine at this dataset size (a handful of
// projects × a few unit types each).
export async function fetchProject(projectId: string): Promise<Project | null> {
  let decoded = projectId;
  try {
    decoded = decodeURIComponent(projectId);
  } catch {
    /* keep raw id */
  }
  decoded = decoded.trim().toLowerCase();

  const projects = await fetchAllProjects();
  return projects.find((p) => p.projectId === decoded) || null;
}
