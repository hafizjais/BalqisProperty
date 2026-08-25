import Image from "next/image";
import { BedDouble, Bath, Ruler, Car, MessageCircle } from "lucide-react";
import type { Project, ProjectUnitType } from "@/lib/types";
import { formatRM, waLink } from "@/lib/constants";

export default function ProjectTypeCard({
  type,
  project,
}: {
  type: ProjectUnitType;
  project: Project;
}) {
  const available = (type.status || "available").toLowerCase() === "available";
  const image = type.floorPlan || project.coverImage;

  const inquiryMessage = `Hi Balqis, saya berminat dengan ${project.projectName} - ${type.typeName}. Boleh share more details?`;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-peach bg-graphite shadow-card sm:flex-row ${
        available ? "" : "opacity-70 grayscale"
      }`}
    >
      {image && (
        <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-56">
          <Image
            src={image}
            alt={type.floorPlan ? `${type.typeName} floor plan` : project.projectName}
            fill
            sizes="224px"
            className={type.floorPlan ? "object-contain bg-cream p-2" : "object-cover"}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-lg font-bold text-espresso">
              {type.typeName}
            </h3>
            {!available && (
              <span className="rounded-full bg-slate-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                Sold Out
              </span>
            )}
          </div>
          <p className="mt-1 text-lg font-bold text-copper">
            {type.price ? formatRM(type.price) : "Price on Request"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-warm-grey">
            {type.bedrooms && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-4 w-4" aria-hidden />
                {type.bedrooms}
              </span>
            )}
            {type.bathrooms !== null && (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" aria-hidden />
                {type.bathrooms}
              </span>
            )}
            {type.builtUpSqft !== null && (
              <span className="flex items-center gap-1">
                <Ruler className="h-4 w-4" aria-hidden />
                {type.builtUpSqft.toLocaleString()} sqft
              </span>
            )}
            {type.carPark && (
              <span className="flex items-center gap-1">
                <Car className="h-4 w-4" aria-hidden />
                {type.carPark}
              </span>
            )}
          </div>
        </div>

        <a
          href={waLink(inquiryMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1eb857] sm:w-fit"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Inquire about {type.typeName}
        </a>
      </div>
    </div>
  );
}
