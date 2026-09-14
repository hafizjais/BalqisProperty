import type { Metadata } from "next";
import ShopLotClient from "@/components/pages/ShopLotClient";

export const metadata: Metadata = {
  title: "Shoplots For Rent/Sale in Johor",
  description:
    "Shoplots, offices and business premises for sale across Johor Bahru and Johor. Balqis Property.",
};

export default function ShopLotPage() {
  return <ShopLotClient />;
}
