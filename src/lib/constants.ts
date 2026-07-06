export const WHATSAPP_NUMBER = "60182656367";
export const INSTAGRAM_HANDLE = "balqismjproperty";
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;
export const AGENT_NAME = "Nurul Balqis";
export const BRAND_NAME = "BalqisMJ Property";
export const SITE_URL = "https://balqismjproperty.vercel.app";

export const JB_AREAS = [
  "Iskandar Puteri",
  "Medini",
  "Puteri Harbour",
  "EduCity",
  "Kota Iskandar",
  "Skudai",
  "Tampoi",
  "Tebrau",
  "Setia Indah",
  "Mount Austin",
  "Taman Molek",
  "Taman Pelangi",
  "Bukit Indah",
  "Danga Bay",
  "Gelang Patah",
  "Permas Jaya",
  "Masai",
  "Pasir Gudang",
  "Kulai",
  "Senai",
  "Kempas",
  "Ulu Tiram",
  "Johor Bahru City Centre",
  "Larkin",
  "Stulang Laut",
  "Taman Universiti",
  "Kangkar Pulai",
];

export function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function formatRM(value: number): string {
  if (!isFinite(value)) return "RM 0";
  return "RM " + Math.round(value).toLocaleString("en-MY");
}

export function priceLabel(listing: { price: number; listingType: string }): string {
  const base = formatRM(listing.price);
  return listing.listingType === "rent" || listing.listingType === "room-rent"
    ? `${base}/month`
    : base;
}
