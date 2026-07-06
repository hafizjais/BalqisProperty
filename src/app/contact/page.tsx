import type { Metadata } from "next";
import ContactClient from "@/components/pages/ContactClient";

export const metadata: Metadata = {
  title: "Contact Balqis",
  description:
    "Contact Nurul Balqis of BalqisMJ Property via WhatsApp or Instagram — property inquiries across Johor Bahru, typically answered within 1–2 hours.",
};

export default function ContactPage() {
  return <ContactClient />;
}
