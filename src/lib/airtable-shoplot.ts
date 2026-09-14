import type { Listing } from "./types";
import { parseRecord } from "./airtable";
import { fetchAllAirtableRecords, escapeFormulaValue } from "./airtable-helpers";

// The Shoplot sheet uses the same column names as the main listings table,
// so it reuses parseRecord() from airtable.ts — just pointed at a
// different table in the same base.
const PAT = process.env.AIRTABLE_PAT!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE_ID = process.env.AIRTABLE_SHOPLOT_TABLE_ID!;
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

function isRealRecord(record: any): boolean {
  return Boolean(String(record.fields?.id || "").trim());
}

export async function fetchAllShoplots(): Promise<Listing[]> {
  const records = await fetchAllAirtableRecords(BASE_URL, PAT);
  return records.filter(isRealRecord).map((r) => parseRecord(r, false));
}

export async function fetchShoplot(id: string): Promise<Listing | null> {
  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    /* keep raw id */
  }
  decoded = decoded.trim();

  const url = new URL(BASE_URL);
  url.searchParams.set("maxRecords", "1");
  url.searchParams.set("filterByFormula", `{id}="${escapeFormulaValue(decoded)}"`);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${PAT}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Airtable fetch failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const record = (data.records || [])[0];
  return record && isRealRecord(record) ? parseRecord(record, true) : null;
}
