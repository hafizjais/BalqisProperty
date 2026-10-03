import type { Project } from "./types";
import * as airtable from "./airtable-projects";
import * as sanity from "./sanity-project";

// PROJECT_DATA_SOURCE=sanity switches projects to Sanity; anything else
// keeps Airtable. Kept separate from the other tables' flags so each
// table's cutover stays independent and can be rolled back on its own.
const sanityEnabled = () => process.env.PROJECT_DATA_SOURCE === "sanity";

export function fetchAllProjects(): Promise<Project[]> {
  return sanityEnabled() ? sanity.getProjectList() : airtable.fetchAllProjects();
}

export function fetchProject(projectId: string): Promise<Project | null> {
  return sanityEnabled() ? sanity.getProject(projectId) : airtable.fetchProject(projectId);
}
