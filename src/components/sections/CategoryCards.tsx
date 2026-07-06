"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Home,
  KeyRound,
  DoorOpen,
  Building2,
  ArrowRight,
} from "lucide-react";
import manifestJson from "@/lib/photo-manifest.json";

const manifest: Record<string, string[]> = manifestJson;

const categories = [
  {
    href: "/buy",
    icon: Home,
    title: "Buy Property",
    tagline: "Find your dream home in JB",
    photo: manifest["prop-001"]?.[0],
  },
  {
    href: "/rent-house",
    icon: KeyRound,
    title: "Rent a House",
    tagline: "Monthly rentals across JB areas",
    photo: manifest["prop-002"]?.[0],
  },
  {
    href: "/rent-room",
    icon: DoorOpen,
    title: "Rent a Room",
    tagline: "Budget-friendly room rentals",
    photo: manifest["prop-003"]?.[0],
  },
  {
    href: "/commercial",
    icon: Building2,
    title: "Commercial",
    tagline: "Shops, offices & industrial space",
    photo: manifest["shoplot-001"]?.[0],
  },
];

// The 4 category entry points — photo-backed cards overlapping the hero edge
export default function CategoryCards() {
  return (
    <section className="relative z-10 -mt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.href}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                href={cat.href}
                className="group relative flex h-60 flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-graphite shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-copper/50 hover:shadow-card-hover"
              >
                {cat.photo && (
                  <Image
                    src={cat.photo}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    aria-hidden
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/45 to-ink/10" />
                <div className="relative p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink/70 text-copper backdrop-blur-sm">
                    <cat.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-espresso">
                    {cat.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-warm-grey">{cat.tagline}</p>
                  <span className="mt-3 flex items-center gap-1 text-sm font-semibold text-copper">
                    Explore
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
