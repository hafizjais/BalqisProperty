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
// developer project (e.g. "Emerald Residence" / "Type A"). Rows sharing the
// same projectId are grouped into a single Project on the site.
export interface ProjectUnitType {
  id: string;
  projectId: string;
  typeName: string; // "Type A", "Type B" ...
  bedrooms: number | null;
  bathrooms: number | null;
  builtUpSqft: number | null;
  price: number; // 0 = "Price on Request"
  status: string; // "available" | "sold out"
  floorPlan: string;
  images: string[];
}

// A project card groups all its unit-type rows together for display.
export interface Project {
  projectId: string;
  projectName: string;
  developer: string;
  projectStage: string; // "New Launch" | "Under Construction" | "Ready to Move In"
  tenure: string;
  description: string;
  amenities: string[];
  area: string;
  areas: string[];
  city: string;
  state: string;
  address: string;
  mapEmbedUrl: string;
  coverImage: string;
  images: string[];
  priceFrom: number;
  featured: boolean;
  postedDate: string;
  types: ProjectUnitType[];
}
