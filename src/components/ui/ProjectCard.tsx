import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { Project } from "@/lib/types";
import { formatRM, waLink } from "@/lib/constants";

export default function ProjectCard({ project }: { project: Project }) {
  const inquiryMessage = `Hi Balqis, saya berminat dengan projek ini: ${project.projectName} di ${project.area || project.city}. Boleh share more details?`;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-peach bg-graphite shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <Link
        href={`/project/${project.projectId}`}
        className="absolute inset-0 z-[1]"
        aria-label={project.projectName}
      />

      <div className="relative h-52 w-full">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.projectName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div
            className="h-full w-full bg-gradient-to-br from-sand via-peach to-copper/50"
            aria-hidden
          />
        )}
        <div className="absolute left-3 top-3 z-[2] flex gap-2">
          <Badge variant={project.projectStage.toLowerCase()}>{project.projectStage}</Badge>
        </div>
      </div>

      <div className="p-4">
        <p className="text-lg font-bold text-copper">
          {project.priceFrom ? `From ${formatRM(project.priceFrom)}` : "Price on Request"}
        </p>
        <h3 className="mt-1 line-clamp-2 font-semibold text-espresso">
          {project.projectName}
        </h3>
        {project.developer && (
          <p className="text-sm text-warm-grey">by {project.developer}</p>
        )}
        <p className="mt-1 flex items-center gap-1 text-sm text-warm-grey">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {project.area || project.city}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-peach pt-3">
          <span className="text-sm text-warm-grey">
            {project.types.length} unit {project.types.length === 1 ? "type" : "types"}
          </span>
          <a
            href={waLink(inquiryMessage)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp inquiry about ${project.projectName}`}
            className="relative z-[2] rounded-full bg-[#25D366] p-2 text-white transition-transform hover:scale-110"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
}
