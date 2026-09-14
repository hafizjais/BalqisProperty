import type { Metadata } from "next";
import ShopLotClient from "@/components/pages/ShopLotClient";

export const metadata: Metadata = {
  title: "Shop Lots For Sale in Johor",
  description:
    "Shop lots, offices and business premises for sale across Johor Bahru and Johor. BalqisMJ Property.",
};

export default function ShopLotPage() {
  return <ShopLotClient />;
}
