import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, CheckCircle2, MessageCircle } from "lucide-react";
import { fetchProject } from "@/lib/airtable-projects";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/ui/Badge";
import Gallery from "@/components/listing/Gallery";
import ProjectTypeCard from "@/components/project/ProjectTypeCard";
import { waLink } from "@/lib/constants";

export const revalidate = 300;

type Props = { params: { projectId: string } };

async function getProject(projectId: string) {
  try {
    return await fetchProject(projectId);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject(params.projectId);
  if (!project) return { title: "Project Not Found" };

  const description = (
    project.description ||
    `${project.projectName} by ${project.developer} in ${project.area || project.city}, ${project.state}.`
  ).slice(0, 160);

  return {
    title: `${project.projectName} | ${project.area || project.city}`,
    description,
    openGraph: {
      title: project.projectName,
      description,
      type: "article",
      images: project.coverImage ? [{ url: project.coverImage }] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = await getProject(params.projectId);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 lg:pb-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Project", href: "/project" },
          { label: project.projectName },
        ]}
      />

      <Gallery images={project.images} title={project.projectName} />

      <div className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={project.projectStage.toLowerCase()}>{project.projectStage}</Badge>
          {project.tenure && <Badge>{project.tenure}</Badge>}
        </div>

        <h1 className="mt-3 font-display text-3xl font-bold text-espresso md:text-4xl">
          {project.projectName}
        </h1>
        {project.developer && (
          <p className="mt-1 text-warm-grey">by {project.developer}</p>
        )}
        <p className="mt-2 flex items-center gap-1.5 text-warm-grey">
          <MapPin className="h-4 w-4 shrink-0 text-copper" aria-hidden />
          {[project.address, project.area, project.city, project.state]
            .filter(Boolean)
            .join(", ")}
        </p>

        {project.amenities.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-2xl font-bold text-espresso">
              Facilities
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {project.amenities.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm text-espresso">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-copper" aria-hidden />
                  {a}
                </li>
              ))}
            </ul>
          </section>
        )}

        {project.description && (
          <section className="mt-8">
            <h2 className="font-display text-2xl font-bold text-espresso">
              About this project
            </h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-espresso/90">
              {project.description}
            </p>
          </section>
        )}

        {project.mapEmbedUrl && (
          <section className="mt-8">
            <h2 className="font-display text-2xl font-bold text-espresso">
              Location
            </h2>
            <div className="mt-4 overflow-hidden rounded-2xl shadow-card">
              <iframe
                src={project.mapEmbedUrl}
                title={`Map location of ${project.projectName}`}
                className="h-80 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </section>
        )}

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-espresso">
              Unit Types
            </h2>
            <a
              href={waLink(
                `Hi Balqis, saya berminat dengan ${project.projectName}. Boleh share more details?`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-copper px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#cf6526]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Inquire via WhatsApp
            </a>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {project.types.map((type) => (
              <ProjectTypeCard key={type.id} type={type} project={project} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
