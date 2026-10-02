import { createClient, type SanityClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { RentalListing } from "./types";

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

const FETCH_OPTIONS = { next: { revalidate: 300, tags: ["rental"] } };

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
  "slug": slug.current,
  houseId,
  title,
  type,
  status,
  bedrooms,
  bathrooms,
  price,
  description,
  areas,
  city,
  address,
  featured,
  "postedDate": coalesce(postedDate, _createdAt)
}`;

type SanityRental = {
  slug: string;
  houseId?: string;
  title?: string;
  type?: string;
  status?: string;
  bedrooms?: string;
  bathrooms?: number;
  price?: number;
  description?: string;
  areas?: string[];
  city?: string;
  address?: string;
  featured?: boolean;
  postedDate?: string;
  images?: SanityImage[];
};

// bedrooms is free text in the source data (e.g. "2+1"); parse it the same
// way the existing Airtable path does — non-numeric values become null.
function parseNum(val: string | number | undefined | null): number | null {
  if (val === undefined || val === null || val === "") return null;
  const num = Number(String(val).replace(/[,\s]/g, ""));
  return Number.isFinite(num) ? num : null;
}

function toRental(doc: SanityRental): RentalListing {
  const images = (doc.images || []).filter((img) => img.asset);
  const areas = doc.areas || [];

  return {
    id: doc.slug,
    houseId: doc.houseId || "",
    title: doc.title || "New Rental — Details Coming Soon",
    type: doc.type || "",
    status: (doc.status || "available").toLowerCase(),
    bedrooms: parseNum(doc.bedrooms),
    bathrooms: doc.bathrooms ?? null,
    price: doc.price ?? 0,
    area: areas.join(", "),
    areas,
    city: doc.city || "Johor Bahru",
    address: doc.address || "",
    description: doc.description || "",
    featured: Boolean(doc.featured),
    coverImage: images[0] ? imageUrl(images[0], 800) : "",
    images: images.map((img) => imageUrl(img, 1600)),
    postedDate: doc.postedDate || "",
  };
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function getRentalList(): Promise<RentalListing[]> {
  const docs = await getClient().fetch<SanityRental[]>(
    `*[_type == "rental" && defined(slug.current)]
      | order(coalesce(postedDate, _createdAt) asc)
      ${PROJECTION.replace(/}$/, `, "images": images[0...1]}`)}`,
    {},
    FETCH_OPTIONS
  );
  return docs.map(toRental);
}

export async function getRental(idOrSlug: string): Promise<RentalListing | null> {
  let decoded = idOrSlug;
  try {
    decoded = decodeURIComponent(idOrSlug);
  } catch {
    /* keep raw id */
  }
  decoded = decoded.trim();

  const doc = await getClient().fetch<SanityRental | null>(
    `*[_type == "rental" && defined(slug.current) && (slug.current in [$id, $slug] || houseId == $id)][0]
      ${PROJECTION.replace(/}$/, `, images}`)}`,
    { id: decoded, slug: slugify(decoded) },
    FETCH_OPTIONS
  );
  return doc ? toRental(doc) : null;
}
