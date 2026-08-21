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
