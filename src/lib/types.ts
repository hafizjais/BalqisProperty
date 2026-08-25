export interface Listing {
  id: string;
  title: string;
  listingType: string; // "sale" | "rent" | "room-rent"
  propertyType: string; // "residential" | "commercial" | "land" ...
  subType: string; // "Terrace", "Condo", "Shophouse" ...
  price: number;
  marketValue: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  carPark: string; // free text in the sheet, e.g. "2-3"
  builtUpSqft: number | null;
  landSqft: string; // lot dimensions in the sheet, e.g. "20x70"
  tenure: string; // sheet column "status pemilikan" — Freehold / Leasehold
  lotStatus: string; // sheet column "status lot tanah" — Bumiputera / Non Bumi / International / Malay Reserved
  furnishing: string;
  status: string; // "available" | "sold" | "rented"
  featured: boolean;
  coverImage: string;
  images: string[];
  amenities: string[];
  description: string;
  postedDate: string;
  area: string; // display string, e.g. "Pulai Mutiara, Tampoi"
  areas: string[]; // individual areas — a listing can cover more than one
  city: string;
  state: string;
  address: string;
  mapEmbedUrl: string;
}

// One row in the "Project" Airtable sheet = one unit type within a
// developer project (e.g. "Monterra Johor Bahru" / "Type A"). Rows sharing
// the same `title` (project name) are grouped into a single Project on the
// site — there's no separate project-code column, so the project name
// itself is the grouping key (must be spelled identically across a
// project's rows).
export interface ProjectUnitType {
  id: string;
  typeName: string; // "Type A", "Type B" ...
  bedrooms: string; // free text — condo layouts use "1+1" etc, not a plain number
  bathrooms: number | null;
  builtUpSqft: number | null;
  carPark: string;
  price: number; // 0 = "Price on Request"
  status: string; // "available" | "sold out"
  floorPlan: string;
}

// A project card groups all its unit-type rows together for display.
// `projectId` is a URL-safe slug derived from the project name, not a
// separate Airtable column.
export interface Project {
  projectId: string;
  projectName: string;
  developer: string;
  projectStage: string; // "New Launch" | "Under Construction" | "Ready to Move In" — blank until that column exists
  tenure: string;
  description: string;
  area: string;
  areas: string[];
  city: string;
  state: string;
  address: string;
  mapEmbedUrl: string;
  siteFloorMap: string; // overall project site/master plan image
  coverImage: string;
  images: string[]; // project photo gallery
  priceFrom: number;
  featured: boolean;
  postedDate: string;
  types: ProjectUnitType[];
}
