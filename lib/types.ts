export interface Listing {
  id: string;
  title: string;
  listingType: string; // "sale" | "rent" | "room-rent"
  propertyType: string; // "residential" | "commercial" | "land" ...
  subType: string; // "Terrace", "Condo", "Shophouse" ...
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  carPark: number | null;
  builtUpSqft: number | null;
  landSqft: number | null;
  tenure: string;
  furnishing: string;
  status: string; // "available" | "sold" | "rented"
  featured: boolean;
  isNew: boolean;
  coverImage: string;
  images: string[];
  amenities: string[];
  description: string;
  postedDate: string;
  area: string;
  city: string;
  state: string;
  address: string;
  mapEmbedUrl: string;
}
