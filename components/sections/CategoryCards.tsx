"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  KeyRound,
  DoorOpen,
  Building2,
  ArrowRight,
} from "lucide-react";

const categories = [
  {
    href: "/buy",
    icon: Home,
    title: "Buy Property",
    tagline: "Find your dream home in JB",
  },
  {
    href: "/rent-house",
    icon: KeyRound,
    title: "Rent a House",
    tagline: "Monthly rentals across JB areas",
  },
  {
    href: "/rent-room",
    icon: DoorOpen,
    title: "Rent a Room",
    tagline: "Budget-friendly room rentals",
  },
  {
    href: "/commercial",
    icon: Building2,
    title: "Commercial",
    tagline: "Shops, offices & industrial space",
  },
];

// The 4 category entry points — primary navigation for the whole site
export default function CategoryCards() {
  return (
    <section className="bg-sand py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-bold text-espresso">
          What are you looking for?
        </h2>
        <p className="mt-2 text-center text-warm-grey">
          Choose a category to explore listings tailored to you
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <Link
                href={cat.href}
                className="group flex h-full flex-col rounded-2xl bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand text-copper">
                  <cat.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-espresso">
                  {cat.title}
                </h3>
                <p className="mt-1 flex-1 text-sm text-warm-grey">
                  {cat.tagline}
                </p>
                <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-copper">
                  Explore
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
