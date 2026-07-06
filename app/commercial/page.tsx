import type { Metadata } from "next";
import CommercialClient from "@/components/pages/CommercialClient";

export const metadata: Metadata = {
  title: "Commercial Properties in Johor Bahru",
  description:
    "Shophouses, offices, SoHo units and industrial space for sale and rent across Johor Bahru. BalqisMJ Property.",
};

export default function CommercialPage() {
  return <CommercialClient />;
}
