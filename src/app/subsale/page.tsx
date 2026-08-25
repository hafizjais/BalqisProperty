import type { Metadata } from "next";
import SubsaleClient from "@/components/pages/SubsaleClient";

export const metadata: Metadata = {
  title: "Subsale Properties For Sale in Johor Bahru",
  description:
    "Browse subsale houses, condos and land for sale in Johor Bahru — with loan, stamp duty, legal fees and affordability calculators. BalqisMJ Property.",
};

export default function SubsalePage() {
  return <SubsaleClient />;
}
