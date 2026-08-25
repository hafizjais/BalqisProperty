"use client";

import { useProjects } from "@/hooks/useProjects";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProjectCard from "@/components/ui/ProjectCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorBanner from "@/components/ui/ErrorBanner";

export default function ProjectClient() {
  const { projects, loading, error } = useProjects();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Project" }]} />
      <h1 className="font-display text-3xl font-bold text-espresso md:text-4xl">
        New Project Launches in Johor Bahru
      </h1>
      <p className="mt-2 text-warm-grey">
        {loading ? "Loading projects…" : `${projects.length} projects available`}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        {!loading && error && <ErrorBanner />}
        {!loading && !error && projects.length === 0 && (
          <EmptyState message="No projects found" />
        )}
        {!loading &&
          !error &&
          projects.map((p) => <ProjectCard key={p.projectId} project={p} />)}
      </div>
    </div>
  );
}
