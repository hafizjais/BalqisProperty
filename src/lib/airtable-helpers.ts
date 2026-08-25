// Shared field-parsing helpers for turning raw Airtable records into typed
// site data. Used by both the listings table (airtable.ts) and the project
// table (airtable-projects.ts).

export const parseNum = (val: any): number | null => {
  if (val === undefined || val === null || val === "") return null;
  const num = Number(String(val).replace(/[,\s]/g, ""));
  return isNaN(num) ? null : num;
};

export const parseBool = (val: any): boolean => {
  if (val === undefined || val === null) return false;
  if (typeof val === "boolean") return val;
  const str = String(val).trim().toLowerCase();
  return str === "true" || str === "1" || str === "yes" || str === "checked";
};

// Airtable multi-select fields arrive as string[]; plain text fields as string.
// Some fields were migrated to multi-select, so this normalises either shape
// into one display string ("Freehold, Tanah Kurnia").
export const joinField = (val: any): string => {
  if (Array.isArray(val)) return val.filter(Boolean).join(", ");
  return val ? String(val).trim() : "";
};

// Normalise either shape (string[] or plain string) into a flat array —
// used for multi-select fields that need per-value matching (e.g. area).
export const toList = (val: any): string[] => {
  if (Array.isArray(val)) return val.map((v) => String(v).trim()).filter(Boolean);
  return val ? [String(val).trim()] : [];
};

// images is an Airtable attachment field: [{ url, ... }, ...].
// The first attachment is used as the card/hero cover photo.
export function attachmentUrls(val: any): string[] {
  if (!Array.isArray(val)) return [];
  return val.map((a) => a?.url).filter(Boolean);
}

// mapEmbedUrl may hold a full <iframe> snippet (pasted from Google Maps
// "Embed a map") or a bare URL — extract just the src either way.
export function extractMapSrc(val: string): string {
  if (!val) return "";
  const m = val.match(/src\s*=\s*"([^"]+)"/) || val.match(/src\s*=\s*'([^']+)'/);
  if (m) return m[1];
  return val.startsWith("http") ? val.trim() : "";
}
