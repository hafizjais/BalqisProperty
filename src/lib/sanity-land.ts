import { createClient, type SanityClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { LandListing } from "./types";

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

const FETCH_OPTIONS = { next: { revalidate: 300, tags: ["land"] } };

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
  landId,
  title,
  category,
  lotStatus,
  ownership,
  rezabTanah,
  status,
  mukim,
  areas,
  city,
  acres,
  buildUpSqft,
  marketValue,
  featured,
  description,
  mapEmbedUrl,
  "postedDate": coalesce(postedDate, _createdAt)
}`;

type SanityLand = {
  landId?: string;
  title?: string;
  category?: string;
  lotStatus?: string;
  ownership?: string[];
  rezabTanah?: string;
  status?: string;
  mukim?: string;
  areas?: string[];
  city?: string;
  acres?: number;
  buildUpSqft?: number;
  marketValue?: number;
  featured?: boolean;
  description?: string;
  mapEmbedUrl?: string;
  postedDate?: string;
  images?: SanityImage[];
};

function toLand(doc: SanityLand): LandListing {
  const images = (doc.images || []).filter((img) => img.asset);
  const areas = doc.areas || [];

  return {
    // Unlike the other tables, the site uses the raw landId directly as the
    // page URL and lookup key — no slug.
    id: doc.landId || "",
    title: doc.title || "New Land Listing — Details Coming Soon",
    category: doc.category || "",
    lotStatus: doc.lotStatus || "",
    ownership: (doc.ownership || []).join(", "),
    rezabTanah: doc.rezabTanah || "",
    status: (doc.status || "available").toLowerCase(),
    mukim: doc.mukim || "",
    area: areas.join(", "),
    areas,
    city: doc.city || "Johor Bahru",
    acres: doc.acres ?? null,
    buildUpSqft: doc.buildUpSqft ?? null,
    marketValue: doc.marketValue ?? 0,
    featured: Boolean(doc.featured),
    coverImage: images[0] ? imageUrl(images[0], 800) : "",
    images: images.map((img) => imageUrl(img, 1600)),
    description: doc.description || "",
    postedDate: doc.postedDate || "",
    mapEmbedUrl: doc.mapEmbedUrl || "",
  };
}

// Ordered oldest-first to match the existing Airtable path (no client-side
// re-sort anywhere that consumes this list).
export async function getLandList(): Promise<LandListing[]> {
  const docs = await getClient().fetch<SanityLand[]>(
    `*[_type == "land" && defined(landId)]
      | order(coalesce(postedDate, _createdAt) asc)
      ${PROJECTION.replace(/}$/, `, "images": images[0...1]}`)}`,
    {},
    FETCH_OPTIONS
  );
  return docs.map(toLand);
}

// Exact match on the raw landId — the site never slugifies it, so this
// mirrors Airtable's filterByFormula {land_id}="..." exact match.
export async function getLand(id: string): Promise<LandListing | null> {
  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    /* keep raw id */
  }
  decoded = decoded.trim();

  const doc = await getClient().fetch<SanityLand | null>(
    `*[_type == "land" && landId == $id][0]${PROJECTION.replace(/}$/, `, images}`)}`,
    { id: decoded },
    FETCH_OPTIONS
  );
  return doc ? toLand(doc) : null;
}
