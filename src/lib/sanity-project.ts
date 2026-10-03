import { createClient, type SanityClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { Project, ProjectUnitType } from "./types";

let client: SanityClient | null = null;
function getClient(): SanityClient {
  if (!client) {
    client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
      apiVersion: process.env.SANITY_API_VERSION || "2025-01-01",
      useCdn: true,
      perspective: "published",
    });
  }
  return client;
}

const FETCH_OPTIONS = { next: { revalidate: 300, tags: ["projects"] } };

type SanityImage = { asset?: { _ref: string }; hotspot?: unknown; crop?: unknown };

function imageUrl(image: SanityImage, maxWidth: number): string {
  const c = getClient().config();
  return createImageUrlBuilder({ projectId: c.projectId!, dataset: c.dataset! })
    .image(image)
    .auto("format")
    .fit("max")
    .width(maxWidth)
    .url();
}

const PROJECTION = `{
  unitId,
  projectName,
  developer,
  completionYear,
  tenure,
  rebate,
  description,
  areas,
  address,
  mapEmbedUrl,
  featured,
  "postedDate": coalesce(postedDate, _createdAt),
  typeName,
  bedrooms,
  bathrooms,
  builtUpSqft,
  carPark,
  price,
  status,
  gallery,
  siteFloorMap,
  floorPlan
}`;

type SanityProjectUnit = {
  unitId?: string;
  projectName?: string;
  developer?: string;
  completionYear?: string;
  tenure?: string;
  rebate?: string;
  description?: string;
  areas?: string[];
  address?: string;
  mapEmbedUrl?: string;
  featured?: boolean;
  postedDate?: string;
  typeName?: string;
  bedrooms?: string;
  bathrooms?: number;
  builtUpSqft?: number;
  carPark?: string;
  price?: number;
  status?: string;
  gallery?: SanityImage[];
  siteFloorMap?: SanityImage[];
  floorPlan?: SanityImage;
};

// Turn a project name into the URL-safe slug used as the route param, same
// rule as the existing Airtable path.
const slugify = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Group unit-type docs into one Project per distinct project-name slug —
// same algorithm as groupIntoProjects() in lib/airtable-projects.ts.
function groupIntoProjects(rows: SanityProjectUnit[]): Project[] {
  const bySlug = new Map<string, SanityProjectUnit[]>();
  for (const row of rows) {
    const slug = slugify(row.projectName || "");
    if (!slug) continue;
    const list = bySlug.get(slug) || [];
    list.push(row);
    bySlug.set(slug, list);
  }

  return Array.from(bySlug.entries()).map(([slug, projectRows]) => {
    const first = projectRows[0];

    const types: ProjectUnitType[] = projectRows.map((r) => ({
      id: r.unitId || "",
      typeName: r.typeName || "",
      bedrooms: r.bedrooms || "",
      bathrooms: r.bathrooms ?? null,
      builtUpSqft: r.builtUpSqft ?? null,
      carPark: r.carPark || "",
      price: r.price ?? 0,
      status: (r.status || "available").toLowerCase(),
      floorPlan: r.floorPlan?.asset ? imageUrl(r.floorPlan, 1600) : "",
    }));

    types.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));

    const prices = types.map((t) => t.price).filter((p) => p > 0);

    const siteFloorMapImages = Array.from(
      new Map(
        projectRows
          .flatMap((r) => r.siteFloorMap || [])
          .filter((img) => img.asset)
          .map((img) => [img.asset!._ref, img])
      ).values()
    ).map((img) => imageUrl(img, 1600));

    const galleryImages = projectRows
      .flatMap((r) => r.gallery || [])
      .filter((img) => img.asset)
      .map((img) => imageUrl(img, 1600));

    const fallbackImages = [
      ...siteFloorMapImages,
      ...types.map((t) => t.floorPlan).filter(Boolean),
    ];
    const images = galleryImages.length > 0 ? galleryImages : fallbackImages;

    const areas = first.areas || [];

    return {
      projectId: slug,
      projectName: first.projectName || "",
      developer: first.developer || "",
      projectStage: "",
      completionYear: first.completionYear || "",
      rebate: first.rebate || "",
      tenure: first.tenure || "",
      description: first.description || "",
      area: areas.join(", "),
      areas,
      city: "Johor Bahru",
      state: "Johor",
      address: first.address || "",
      mapEmbedUrl: first.mapEmbedUrl || "",
      siteFloorMap: siteFloorMapImages,
      coverImage: images[0] || "",
      images,
      priceFrom: prices.length > 0 ? Math.min(...prices) : 0,
      featured: projectRows.some((r) => r.featured),
      postedDate: first.postedDate || "",
      types,
    };
  });
}

// Oldest-first grouping order, same as the existing Airtable path (Map
// insertion order from raw Airtable record order, no client-side re-sort).
export async function getProjectList(): Promise<Project[]> {
  const rows = await getClient().fetch<SanityProjectUnit[]>(
    `*[_type == "projectUnit" && defined(projectName)] | order(coalesce(postedDate, _createdAt) asc) ${PROJECTION}`,
    {},
    FETCH_OPTIONS
  );
  return groupIntoProjects(rows);
}

export async function getProject(projectId: string): Promise<Project | null> {
  let decoded = projectId;
  try {
    decoded = decodeURIComponent(projectId);
  } catch {
    /* keep raw id */
  }
  decoded = decoded.trim().toLowerCase();

  const projects = await getProjectList();
  return projects.find((p) => p.projectId === decoded) || null;
}
