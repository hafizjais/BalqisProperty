// Generates sheet_data.csv — one row per photo folder in public/photos/,
// with dummy property details and image columns (coverImage + image2…image20)
// filled from the folder's photos. If a folder has more than 20 photos,
// a random 20 are selected (stable across re-runs, seeded by folder name).
//
// Import into Google Sheets: File → Import → Upload → sheet_data.csv
// → "Replace current sheet". Then edit the dummy details with real info.
//
// Run with:  node scripts/generate-sheet-data.mjs
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const ROOT = process.cwd();
const manifest = JSON.parse(
  readFileSync(path.join(ROOT, "src", "lib", "photo-manifest.json"), "utf8")
);

const MAX_IMAGES = 20;

// ---- deterministic RNG seeded by folder name --------------------------------
function seedFrom(str) {
  let h = 2166136261;
  for (const c of str) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed) {
  let s = seed;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---- dummy data pools --------------------------------------------------------
const AREAS = [
  "Mount Austin", "Tebrau", "Skudai", "Iskandar Puteri", "Bukit Indah",
  "Taman Molek", "Permas Jaya", "Setia Indah", "Taman Universiti", "Masai",
  "Kempas", "Ulu Tiram", "Johor Bahru City Centre", "Larkin", "Taman Pelangi",
  "Danga Bay", "Kulai", "Senai", "Gelang Patah", "Medini",
];
const SALE_TYPES = ["Terrace", "Semi-D", "Apartment", "Condo"];
const RENT_TYPES = ["Condo", "Apartment", "Terrace"];
const FURNISHING = ["Fully Furnished", "Partially Furnished", "Unfurnished"];
const AMENITIES = {
  sale: "Playground, 24-hour Security, Near Schools, Surau",
  rent: "Swimming Pool, Gym, 24-hour Security, Covered Parking",
  "room-rent": "WiFi, Air-Conditioning, Water & Electricity Included, Weekly Cleaning, Light Cooking Allowed",
  commercial: "Main Road Frontage, High Traffic, Ample Parking",
};

function buildRow(folder, index) {
  const rand = rng(seedFrom(folder));
  const area = AREAS[index % AREAS.length];
  const isShop = folder.startsWith("shoplot");

  let listingType, propertyType, subType, title, price;
  let bedrooms = "", bathrooms = "", carPark = "", builtUpSqft = "";

  if (isShop) {
    listingType = "sale";
    propertyType = "commercial";
    subType = "Shophouse";
    price = 880000 + Math.round(rand() * 400) * 1000;
    builtUpSqft = 1540 + Math.round(rand() * 10) * 100;
    carPark = 2;
    title = `Double Storey Shoplot, ${area}`;
  } else {
    const kind = index % 3; // 0 = sale, 1 = rent, 2 = room-rent
    if (kind === 0) {
      listingType = "sale";
      propertyType = "residential";
      subType = SALE_TYPES[index % SALE_TYPES.length];
      price = 380000 + Math.round(rand() * 570) * 1000;
      bedrooms = 3 + Math.floor(rand() * 3);
      bathrooms = 2 + Math.floor(rand() * 2);
      carPark = 1 + Math.floor(rand() * 2);
      builtUpSqft = 1000 + Math.round(rand() * 14) * 100;
      title = `${subType} For Sale, ${area}`;
    } else if (kind === 1) {
      listingType = "rent";
      propertyType = "residential";
      subType = RENT_TYPES[index % RENT_TYPES.length];
      price = 1100 + Math.round(rand() * 30) * 50;
      bedrooms = 2 + Math.floor(rand() * 3);
      bathrooms = 1 + Math.floor(rand() * 2);
      carPark = 1 + Math.floor(rand() * 2);
      builtUpSqft = 700 + Math.round(rand() * 12) * 100;
      title = `${subType} For Rent, ${area}`;
    } else {
      listingType = "room-rent";
      propertyType = "residential";
      subType = "Room";
      price = 450 + Math.round(rand() * 50) * 10;
      bedrooms = 1;
      bathrooms = 1;
      title = `Room For Rent, ${area}`;
    }
  }

  // ---- images: cover.* preferred as cover, random 20 max ----------------------
  const photos = manifest[folder] || [];
  let selected = [...photos];
  if (selected.length > MAX_IMAGES) {
    // keep cover.* (already first in the manifest), shuffle the rest, take 20
    const cover = selected[0];
    const rest = selected.slice(1);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    selected = [cover, ...rest.slice(0, MAX_IMAGES - 1)];
  }
  const imageCols = Array.from({ length: MAX_IMAGES }, (_, i) => selected[i] || "");

  const day = String(1 + (index % 28)).padStart(2, "0");
  const month = index < 28 ? "06" : "07";

  return {
    id: folder,
    title,
    listingType,
    propertyType,
    subType,
    price,
    bedrooms,
    bathrooms,
    carPark,
    builtUpSqft,
    landSqft: "",
    tenure: isShop || listingType === "sale" ? (rand() > 0.4 ? "Freehold" : "Leasehold") : "",
    furnishing: listingType === "room-rent" ? "Fully Furnished" : FURNISHING[index % FURNISHING.length],
    status: "available",
    featured: index % 9 === 0 ? "TRUE" : "FALSE",
    isNew: index % 4 === 0 ? "TRUE" : "FALSE",
    address: `Jalan ${area} ${1 + (index % 12)}, ${area}, Johor Bahru, Johor`,
    area,
    city: "Johor Bahru",
    state: "Johor",
    postedDate: `2026-${month}-${day}`,
    description: `PLACEHOLDER — replace with real details. ${title}. Contact Balqis on WhatsApp for viewing and more information.`,
    amenities: AMENITIES[isShop ? "commercial" : listingType],
    mapEmbedUrl: "",
    coverImage: imageCols[0],
    ...Object.fromEntries(imageCols.slice(1).map((v, i) => [`image${i + 2}`, v])),
  };
}

// ---- write CSV ----------------------------------------------------------------
// Matches the BalqisMJ sheet template: no header row, leading empty column,
// and the template's exact column order — so it can be appended directly via
// File → Import → Upload → "Append rows to current sheet".
const folders = Object.keys(manifest).sort();
const rows = folders.map((folder, i) => buildRow(folder, i));

const headers = [
  "id", "title", "listingType", "propertyType", "subType", "price",
  "area", "city", "state", "address", "mapEmbedUrl",
  "bedrooms", "bathrooms", "carPark", "builtUpSqft", "landSqft",
  "tenure", "furnishing", "status", "featured", "isNew",
  "amenities", "description", "coverImage",
  ...Array.from({ length: 19 }, (_, i) => `image${i + 2}`),
];
const esc = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = rows
  .map((r) => "," + headers.map((h) => esc(r[h])).join(","))
  .join("\n");

writeFileSync(path.join(ROOT, "sheet_data.csv"), csv);

const totalImgs = rows.reduce(
  (n, r) => n + headers.filter((h) => (h === "coverImage" || h.startsWith("image")) && r[h]).length,
  0
);
console.log(`sheet_data.csv: ${rows.length} properties, ${totalImgs} image cells filled (max ${MAX_IMAGES}/property)`);
