export const WHATSAPP_NUMBER = "60182656367";
export const INSTAGRAM_HANDLE = "balqismjproperty";
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;
export const TELEGRAM_URL = "https://t.me/balqismjrental";
export const AGENT_NAME = "Nurul Balqis";
export const BRAND_NAME = "BalqisMJ Property";
export const SITE_URL = "https://balqismjproperty.vercel.app";

// Agency details, as printed on Nurul Balqis's business card — shown on the
// homepage hero for buyer/seller trust and compliance.
export const AGENCY_NAME = "OD Legacy Realty Sdn. Bhd.";
export const AGENCY_REG_NO = "E (1) 2004/1";
export const AGENT_TITLE = "Business Development";
export const AGENCY_PHONES = ["(+607) 231 5530", "(+6018) 265 6367"];
export const AGENCY_EMAILS = ["onedream.mns@gmail.com", "balqismjproperty@gmail.com"];
export const AGENCY_ADDRESS =
  "S-17-03 & S-18-03, Pusat Komersil Visi Medini, Persiaran Medini 2, Bandar Medini Iskandar Puteri, Johor Darul Takzim";

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
  if (!listing.price) return "Price on Request";
  const base = formatRM(listing.price);
  return listing.listingType === "rent" || listing.listingType === "room-rent"
    ? `${base}/month`
    : base;
}
