import { NextResponse } from "next/server";
import { fetchAllProjects } from "@/lib/airtable-projects";

export const revalidate = 300;

export async function GET() {
  try {
    const projects = await fetchAllProjects();
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json({ error: "Projects fetch failed" }, { status: 502 });
  }
}
