import type { Metadata } from "next";
import RentalClient from "@/components/pages/RentalClient";

export const metadata: Metadata = {
  title: "Rental Properties in Johor Bahru",
  description:
    "Browse apartments, flats, condos and houses for monthly rent in Johor Bahru. BalqisMJ Property.",
};

export default function RentalPage() {
  return <RentalClient />;
}
