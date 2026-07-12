import type { Listing } from "./types";
import manifestJson from "./photo-manifest.json";

// folder name (= sheet `id` column, e.g. "prop-002") → local image paths
const photoManifest: Record<string, string[]> = manifestJson;

// The Google Sheet must be shared as "Anyone with the link: Viewer".
// GOOGLE_SHEET_ID is the long string between /d/ and /edit in the sheet URL.
// GOOGLE_SHEET_GID is the tab id from #gid=... in the URL (0 = first tab).
// Accept a bare ID, or a full URL / ID with trailing "/edit…" pasted in
function extractSheetId(raw: string): string {
  const m = raw.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  return raw.split(/[/?#]/)[0].trim();
}

const SHEET_ID = extractSheetId(process.env.GOOGLE_SHEET_ID || "");
// Only pass gid when explicitly set — otherwise Google uses the first tab
const SHEET_GID = (process.env.GOOGLE_SHEET_GID || "").trim();
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv${
  SHEET_GID ? `&gid=${SHEET_GID}` : ""
}`;

// ---------------------------------------------------------------------------
// CSV parsing (handles quoted fields with commas and line breaks)
// ---------------------------------------------------------------------------
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      cell = "";
      rows.push(row);
      row = [];
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Field helpers
// ---------------------------------------------------------------------------

// Normalize local static image paths or keep external URLs
function normalizeImagePath(pathStr: any): string {
  if (!pathStr || typeof pathStr !== "string") return "";
  if (pathStr.startsWith("http://") || pathStr.startsWith("https://")) {
    return pathStr;
  }
  let normalized = pathStr.replace(/\\/g, "/");
  normalized = normalized.replace(/^(?:[^\/]+\/)?public\//i, "");
  if (!normalized.startsWith("/")) normalized = "/" + normalized;
  return normalized;
}

const parseNum = (val: any): number | null => {
  if (val === undefined || val === null || val === "") return null;
  const num = Number(String(val).replace(/[,\s]/g, ""));
  return isNaN(num) ? null : num;
};

const parseBool = (val: any): boolean => {
  if (val === undefined || val === null) return false;
  if (typeof val === "boolean") return val;
  const str = String(val).trim().toLowerCase();
  return str === "true" || str === "1" || str === "yes" || str === "checked";
};

// The sheet stores the full <iframe …> embed snippet — extract the src URL.
// Also accepts a bare URL for backwards compatibility.
function extractMapSrc(val: string): string {
  if (!val) return "";
  const m = val.match(/src\s*=\s*"([^"]+)"/) || val.match(/src\s*=\s*'([^']+)'/);
  if (m) return m[1];
  return val.startsWith("http") ? val.trim() : "";
}

// Turn one sheet row (as a header→value object) into a Listing
export function parseRow(f: Record<string, string>): Listing {
  const sheetId = String(f.id || "").trim();

  // Image columns (coverImage/image2…image20) are ignored for now — photos
  // come from public/photos/<id>/ via the manifest when a folder matches.
  const folderPhotos = photoManifest[sheetId] || [];

  return {
    id: sheetId,
    title: f.title || "",
    listingType: (f.listingType || "").trim().toLowerCase(),
    propertyType: (f.propertyType || "").trim().toLowerCase(),
    subType: f.subType || "",
    price: parseNum(f.price) || 0,
    bedrooms: parseNum(f.bedrooms),
    bathrooms: parseNum(f.bathrooms),
    carPark: (f.carPark || "").trim(),
    builtUpSqft: parseNum(f.builtUpSqft),
    landSqft: (f.landSqft || "").trim(),
    tenure: (f["status pemilikan"] || f.tenure || "").trim(),
    lotStatus: (f["status lot tanah"] || "").trim(),
    furnishing: f.furnishing || "",
    status: (f.status || "available").trim().toLowerCase() || "available",
    featured: parseBool(f.featured),
    isNew: parseBool(f.isNew),
    coverImage: folderPhotos[0] || "",
    images: folderPhotos,
    amenities: f.amenities
      ? f.amenities.split(",").map((a: string) => a.trim()).filter(Boolean)
      : [],
    description: f.description || "",
    postedDate: f.postedDate || "",
    area: f.area || "",
    city: (f.daerah || f.city || "Johor Bahru").trim(),
    state: f.state || "Johor",
    address: f.address || "",
    mapEmbedUrl: extractMapSrc(f.mapEmbedUrl || ""),
  };
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------
async function fetchSheetRows(): Promise<Record<string, string>[]> {
  const res = await fetch(CSV_URL, {
    next: { revalidate: 300 }, // cache for 5 minutes, auto-refresh
    redirect: "follow",
  });

  if (!res.ok) throw new Error("Google Sheets fetch failed");

  const text = await res.text();
  if (text.trimStart().startsWith("<")) {
    // Got an HTML login page instead of CSV
    throw new Error(
      'Sheet is not public — share it as "Anyone with the link: Viewer"'
    );
  }

  const rows = parseCsv(text);

  // The template has banner/section rows above the real header row —
  // find the row that contains both "id" and "title" column names
  const headerIdx = rows.findIndex((r) => {
    const cells = r.map((c) => c.trim());
    return cells.includes("id") && cells.includes("title");
  });
  if (headerIdx === -1 || rows.length <= headerIdx + 1) return [];

  const headers = rows[headerIdx].map((h) => h.trim());
  return rows.slice(headerIdx + 1).map((cells) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      if (h) obj[h] = (cells[i] ?? "").trim();
    });
    return obj;
  });
}

function isRealRow(f: Record<string, string>): boolean {
  const id = String(f.id || "").trim();
  // Skip blank rows and instruction/template rows like "prop-001 (unique, no spaces)"
  return Boolean(id) && !id.includes("(") && Boolean((f.title || "").trim());
}

export async function fetchAllListings(
  listingType?: string | null
): Promise<Listing[]> {
  const rows = await fetchSheetRows();
  let listings = rows.filter(isRealRow).map(parseRow);
  if (listingType) {
    listings = listings.filter((l) => l.listingType === listingType);
  }
  return listings;
}

export async function fetchListing(id: string): Promise<Listing | null> {
  // ids can contain spaces (e.g. "Sub - 001") and arrive URL-encoded
  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    /* keep raw id */
  }
  const rows = await fetchSheetRows();
  const row = rows
    .filter(isRealRow)
    .find((f) => String(f.id || "").trim() === decoded.trim());
  return row ? parseRow(row) : null;
}
