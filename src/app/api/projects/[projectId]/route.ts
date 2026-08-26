import { NextResponse } from "next/server";
import { fetchProject } from "@/lib/airtable-projects";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const project = await fetchProject(params.projectId);
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "Project fetch failed" }, { status: 502 });
  }
}
