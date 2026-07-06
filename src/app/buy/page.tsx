import type { Metadata } from "next";
import BuyClient from "@/components/pages/BuyClient";

export const metadata: Metadata = {
  title: "Properties For Sale in Johor Bahru",
  description:
    "Browse houses, condos and land for sale in Johor Bahru — with loan, stamp duty, legal fees and affordability calculators. BalqisMJ Property.",
};

export default function BuyPage() {
  return <BuyClient />;
}
