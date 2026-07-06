import type { Metadata } from "next";
import { TrainFront, Map, Wallet, MessageCircle } from "lucide-react";
import HeroSection from "@/components/sections/HeroSection";
import CategoryCards from "@/components/sections/CategoryCards";
import FeaturedListings from "@/components/sections/FeaturedListings";
import Button from "@/components/ui/Button";
import { waLink } from "@/lib/constants";

export const metadata: Metadata = {
  title: "BalqisMJ Property | Buy, Sell & Rent Property in Johor Bahru",
  description:
    "Your trusted property partner in Johor Bahru. Browse houses for sale, rentals, rooms and commercial properties across JB with Nurul Balqis of BalqisMJ Property.",
};

const whyJB = [
  {
    icon: TrainFront,
    title: "RTS Link",
    text: "Direct rail link to Singapore Woodlands by 2026",
  },
  {
    icon: Map,
    title: "Iskandar Malaysia",
    text: "Southeast Asia's largest development corridor",
  },
  {
    icon: Wallet,
    title: "Affordable Prices",
    text: "Premium properties at a fraction of Singapore costs",
  },
];

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryCards />

      {/* Why Johor Bahru? */}
      <section className="bg-cream py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center font-display text-3xl font-bold text-espresso">
            Why Johor Bahru?
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {whyJB.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-6 text-center shadow-card"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sand text-copper">
                  <item.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold text-espresso">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-warm-grey">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedListings />

      {/* WhatsApp CTA banner */}
      <section className="bg-copper">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-12 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <div>
            <p className="font-display text-2xl font-bold text-white">
              Not sure where to start? Let&apos;s chat.
            </p>
            <p className="mt-1 text-sm text-white/90">
              Tell Balqis what you need — she&apos;ll do the searching for you.
            </p>
          </div>
          <Button
            variant="light"
            href={waLink("Hi Balqis, I'm not sure where to start. Can you guide me?")}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            WhatsApp Balqis
          </Button>
        </div>
      </section>
    </>
  );
}
