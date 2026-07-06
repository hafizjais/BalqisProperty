import type { Metadata } from "next";
import RentRoomClient from "@/components/pages/RentRoomClient";

export const metadata: Metadata = {
  title: "Rooms For Rent in Johor Bahru",
  description:
    "Budget-friendly room rentals in verified, well-maintained houses across Johor Bahru from RM200 to RM1,500/month. BalqisMJ Property.",
};

export default function RentRoomPage() {
  return <RentRoomClient />;
}
