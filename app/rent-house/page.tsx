import type { Metadata } from "next";
import RentHouseClient from "@/components/pages/RentHouseClient";

export const metadata: Metadata = {
  title: "Houses & Units For Rent in Johor Bahru",
  description:
    "Full unit rentals across Johor Bahru — terrace houses, apartments and condos from RM500 to RM5,000/month. BalqisMJ Property.",
};

export default function RentHousePage() {
  return <RentHouseClient />;
}
