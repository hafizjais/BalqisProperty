"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { waLink } from "@/lib/constants";

const stats = [
  { value: "200+", label: "Transactions" },
  { value: "8+", label: "Years Experience" },
  { value: "JB", label: "Specialist" },
];

export default function HeroSection() {
  return (
    <section className="grid min-h-[70vh] grid-cols-1 lg:min-h-[85vh] lg:grid-cols-2">
      {/* Agent photo — landscape banner on mobile, full-height portrait on desktop */}
      <div className="relative h-64 w-full sm:h-80 lg:h-auto">
        <Image
          src="/agent-balqis.png"
          alt="Nurul Balqis, property agent in Johor Bahru"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-top"
        />
      </div>

      <div className="flex items-center bg-cream">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="px-6 py-12 sm:px-10 lg:px-16"
        >
          <h1 className="font-display text-4xl font-bold leading-tight text-espresso sm:text-5xl">
            Your Trusted Property Partner in Johor Bahru
          </h1>
          <p className="mt-4 text-lg text-warm-grey">
            Nurul Balqis · BalqisMJ Property · Buy, Sell &amp; Rent in JB
          </p>

          <div className="mt-8 flex divide-x divide-sand rounded-2xl bg-white py-4 shadow-card">
            {stats.map((s) => (
              <div key={s.label} className="flex-1 px-4 text-center">
                <p className="font-display text-2xl font-bold text-copper">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-warm-grey">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" href="/buy">
              Browse All Listings
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              variant="whatsapp"
              href={waLink(
                "Hi Balqis, I'm looking for property in JB. Can you help?"
              )}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp Me
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
