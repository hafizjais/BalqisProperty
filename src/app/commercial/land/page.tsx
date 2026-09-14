import type { Metadata } from "next";
import LandClient from "@/components/pages/LandClient";

export const metadata: Metadata = {
  title: "Land For Sale in Johor",
  description:
    "Residential, agricultural and development land for sale across Johor Bahru and Johor. BalqisMJ Property.",
};

export default function LandPage() {
  return <LandClient />;
}
