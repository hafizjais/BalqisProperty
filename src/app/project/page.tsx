import type { Metadata } from "next";
import ProjectClient from "@/components/pages/ProjectClient";

export const metadata: Metadata = {
  title: "New Project Launches in Johor Bahru",
  description:
    "Browse new developer project launches in Johor Bahru — unit types, pricing and floor plans. BalqisMJ Property.",
};

export default function ProjectPage() {
  return <ProjectClient />;
}
