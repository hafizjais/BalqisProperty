import { createClient, type SanityClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { Listing } from "./types";

// Read-only access to the public "production" dataset — no token needed.
// Created lazily so that importing this module never throws on a deploy that
// doesn't have the Sanity env vars yet (while DATA_SOURCE is still airtable).
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

// Unlike Airtable's expiring attachment URLs, Sanity image URLs are
// permanent, so Next's data cache is safe here. Publishing in the Studio
// triggers /api/revalidate (via a Sanity webhook) to refresh immediately;
// the 5-minute revalidate is only the fallback.
const FETCH_OPTIONS = { next: { revalidate: 300, tags: ["listings"] } };

type SanityImage = { asset?: { _ref: string }; hotspot?: unknown; crop?: unknown };

function imageUrl(image: SanityImage, maxWidth: number): string {
  const c = getClient().config();
  return createImageUrlBuilder({ projectId: c.projectId!, dataset: c.dataset! })
    .image(image)
    .auto("format")
    .fit("max") // keep the original aspect ratio, only cap the width
    .width(maxWidth)
    .url();
}

const PROJECTION = `{
  "slug": slug.current,
  listingCode,
  title,
  listingType,
  propertyType,
  subType,
  price,
  marketValue,
  bedrooms,
  bathrooms,
  carPark,
  builtUpSqft,
  landSqft,
  tenure,
  lotStatus,
  furnishing,
  status,
  featured,
  description,
  amenities,
  areas,
  city,
  state,
  address,
  mapEmbedUrl,
  "postedDate": coalesce(postedDate, _createdAt)
}`;

type SanityListing = {
  slug: string;
  listingCode?: string;
  title?: string;
  listingType?: string;
  propertyType?: string;
  subType?: string;
  price?: number;
  marketValue?: number;
  bedrooms?: number;
  bathrooms?: number;
  carPark?: string;
  builtUpSqft?: number;
  landSqft?: string;
  tenure?: string[];
  lotStatus?: string[];
  furnishing?: string;
  status?: string;
  featured?: boolean;
  description?: string;
  amenities?: string[];
  areas?: string[];
  city?: string;
  state?: string;
  address?: string;
  mapEmbedUrl?: string;
  postedDate?: string;
  images?: SanityImage[];
};

function toListing(doc: SanityListing): Listing {
  const images = (doc.images || []).filter((img) => img.asset);
  const areas = doc.areas || [];

  return {
    id: doc.slug,
    title: doc.title || "New Listing — Details Coming Soon",
    listingType: (doc.listingType || "").toLowerCase(),
    propertyType: (doc.propertyType || "").toLowerCase(),
    subType: doc.subType || "",
    price: doc.price ?? 0,
    marketValue: doc.marketValue ?? null,
    bedrooms: doc.bedrooms ?? null,
    bathrooms: doc.bathrooms ?? null,
    carPark: doc.carPark || "",
    builtUpSqft: doc.builtUpSqft ?? null,
    landSqft: doc.landSqft || "",
    tenure: (doc.tenure || []).join(", "),
    lotStatus: (doc.lotStatus || []).join(", "),
    furnishing: doc.furnishing || "",
    status: (doc.status || "available").toLowerCase(),
    featured: Boolean(doc.featured),
    // Cards render ~400px wide, so the cover doesn't need the full 1600px.
    coverImage: images[0] ? imageUrl(images[0], 800) : "",
    images: images.map((img) => imageUrl(img, 1600)),
    amenities: doc.amenities || [],
    description: doc.description || "",
    postedDate: doc.postedDate || "",
    area: areas.join(", "),
    areas,
    city: doc.city || "Johor Bahru",
    state: doc.state || "Johor",
    address: doc.address || "",
    mapEmbedUrl: doc.mapEmbedUrl || "",
  };
}

// Same slug rules as the Studio and the migration script ("Sub - 112" -> "sub-112").
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");

// List views only show the cover photo, so only the first image is fetched
// here (same trade-off as the Airtable version); getListing has the full set.
export async function getListings(listingType?: string | null): Promise<Listing[]> {
  const docs = await getClient().fetch<SanityListing[]>(
    `*[_type == "listing" && defined(slug.current) && (!defined($type) || listingType == $type)]
      | order(coalesce(postedDate, _createdAt) desc)
      ${PROJECTION.replace(/}$/, `, "images": images[0...1]}`)}`,
    { type: listingType || null },
    FETCH_OPTIONS
  );
  return docs.map(toListing);
}

// Matches the slug or the original listing code, so old links like
// /listings/Sub%20-%20112 keep resolving after the switch.
export async function getListing(idOrSlug: string): Promise<Listing | null> {
  let decoded = idOrSlug;
  try {
    decoded = decodeURIComponent(idOrSlug);
  } catch {
    /* keep raw id */
  }
  decoded = decoded.trim();

  const doc = await getClient().fetch<SanityListing | null>(
    `*[_type == "listing" && defined(slug.current) && (slug.current in [$id, $slug] || listingCode == $id)][0]
      ${PROJECTION.replace(/}$/, `, images}`)}`,
    { id: decoded, slug: slugify(decoded) },
    FETCH_OPTIONS
  );
  return doc ? toListing(doc) : null;
}
