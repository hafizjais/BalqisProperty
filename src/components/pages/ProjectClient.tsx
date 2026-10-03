"use client";

import { useState, useMemo } from "react";
import { useProjects } from "@/hooks/useProjects";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProjectCard from "@/components/ui/ProjectCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { SearchQueryReader, SearchQueryBanner } from "@/components/ui/SearchQuery";
import { matchesQuery } from "@/lib/search";

export default function ProjectClient() {
  const { projects, loading, error } = useProjects();
  const [query, setQuery] = useState(""); // keyword from the homepage hero search (?q=)
  const filtered = useMemo(
    () =>
      projects.filter((p) => matchesQuery(query, [p.projectName, p.areas, p.address, p.developer])),
    [projects, query]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Project" }]} />
      <h1 className="font-display text-3xl font-bold text-espresso md:text-4xl">
        New Project Launches in Johor Bahru
      </h1>
      <p className="mt-2 text-warm-grey">
        {loading ? "Loading projects…" : `${filtered.length} projects available`}
      </p>
      <SearchQueryReader onChange={setQuery} />
      <SearchQueryBanner query={query} />

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        {!loading && error && <ErrorBanner />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState message="No projects found" />
        )}
        {!loading &&
          !error &&
          filtered.map((p) => <ProjectCard key={p.projectId} project={p} />)}
      </div>
    </div>
  );
}
