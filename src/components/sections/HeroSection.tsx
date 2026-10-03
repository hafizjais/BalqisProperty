"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Search, MessageCircle, Send, Phone, Mail, Home, BadgeCheck } from "lucide-react";
import {
  waLink,
  TELEGRAM_URL,
  TELEGRAM_SUBSALE_URL,
  AGENCY_NAME,
  AGENCY_REG_NO,
  AGENCY_PHONE,
  AGENCY_EMAIL,
} from "@/lib/constants";
import { SEARCH_CATEGORIES, searchHref, type SearchCategory } from "@/lib/search";

// Full-bleed hero with a property search front and centre. Popular areas,
// suggestions and the property count all come from live listing data
// (computed in app/page.tsx), so they stay current as listings change.
export default function HeroSection({
  popularAreas,
  suggestions,
  totalCount,
}: {
  popularAreas: string[];
  suggestions: string[];
  totalCount: number;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [category, setCategory] = useState<SearchCategory>("subsale");
  const [query, setQuery] = useState("");

  const go = (q: string) => router.push(searchHref(category, q));
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    go(query);
  };

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: "easeOut" as const },
  });

  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-black">
      {/* Backdrop — slow "Ken Burns" settle for a premium, cinematic feel */}
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 14, ease: "easeOut" }}
        aria-hidden
      >
        <Image
          src="/hero-property.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      {/* Layered overlays: neutral dim (the brand's brown would tint the
          photo sepia), a soft vignette, and a deep base for the cards below */}
      <div className="absolute inset-0 bg-black/45" aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/70 to-transparent" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-36 pt-20 text-center sm:px-6 sm:pt-24">
        <motion.p
          {...fadeUp(0)}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.18em] text-cream backdrop-blur-md sm:text-sm sm:tracking-[0.25em]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-copper" aria-hidden />
          BalqisMJ Property · Johor Bahru
        </motion.p>

        <motion.h1
          {...fadeUp(0.1)}
          className="mx-auto mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.1] text-cream [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] sm:text-6xl lg:text-7xl"
        >
          Your Trusted Property Partner in{" "}
          <em className="whitespace-nowrap font-semibold text-copper">Johor Bahru</em>
        </motion.h1>

        <motion.p
          {...fadeUp(0.2)}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-cream/85 sm:text-lg"
        >
          Subsale homes, rentals, new launches, shop lots and land — search them all in one
          place, and deal directly with Nurul Balqis from first viewing to handover.
        </motion.p>

        {/* Trust chips — every figure here is real, not marketing filler */}
        <motion.ul {...fadeUp(0.3)} className="mt-6 flex flex-wrap justify-center gap-2">
          {totalCount > 0 && (
            <li className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-cream backdrop-blur-md sm:text-sm">
              <Home className="h-3.5 w-3.5 text-copper" aria-hidden />
              {totalCount} properties listed
            </li>
          )}
          <li className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-cream backdrop-blur-md sm:text-sm">
            <MapPin className="h-3.5 w-3.5 text-copper" aria-hidden />
            Johor Bahru &amp; surrounding areas
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-cream backdrop-blur-md sm:text-sm">
            <BadgeCheck className="h-3.5 w-3.5 text-copper" aria-hidden />
            {AGENCY_NAME} · {AGENCY_REG_NO}
          </li>
        </motion.ul>

        {/* Search panel */}
        <motion.div {...fadeUp(0.4)} className="mx-auto mt-10 max-w-3xl text-left">
          <div
            role="group"
            aria-label="Property category"
            className="flex gap-1 overflow-x-auto rounded-t-2xl border border-b-0 border-white/15 bg-black/45 p-1.5 backdrop-blur-md [scrollbar-width:none] sm:inline-flex"
          >
            {SEARCH_CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                aria-pressed={category === c.key}
                onClick={() => setCategory(c.key)}
                className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition-colors sm:px-4 ${
                  category === c.key
                    ? "bg-cream text-espresso shadow"
                    : "text-cream/80 hover:bg-white/10 hover:text-cream"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={onSubmit}
            role="search"
            className="flex flex-col gap-2 rounded-2xl bg-cream p-2 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.5)] sm:flex-row sm:rounded-tl-none"
          >
            <label className="flex flex-1 items-center gap-3 rounded-xl px-4 py-2 transition-colors focus-within:bg-sand/50">
              <MapPin className="h-5 w-5 shrink-0 text-copper" aria-hidden />
              <span className="flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-warm-grey">
                  Location or keyword
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  list="hero-search-suggestions"
                  placeholder="e.g. Skudai, Mount Austin, Pasir Gudang"
                  className="w-full bg-transparent text-base text-espresso placeholder:text-warm-grey/70 focus:outline-none"
                />
              </span>
            </label>
            <datalist id="hero-search-suggestions">
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-copper px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#cf6526] focus:outline-none focus-visible:ring-4 focus-visible:ring-copper/40"
            >
              <Search className="h-5 w-5" aria-hidden />
              Search
            </button>
          </form>

          {/* One-tap keywords — go straight to filtered results */}
          {popularAreas.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="text-sm font-medium text-cream/75">Popular:</span>
              {popularAreas.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => go(area)}
                  className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-sm text-cream backdrop-blur-md transition-colors hover:border-copper hover:bg-copper hover:text-white"
                >
                  {area}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Talk to Balqis directly */}
        <motion.div
          {...fadeUp(0.5)}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-cream/85"
        >
          <a
            href={waLink("Hi Balqis, I'm looking for property in JB. Can you help?")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#1eb857]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            WhatsApp Balqis
          </a>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-copper"
          >
            <Send className="h-4 w-4" aria-hidden />
            Telegram: Rental
          </a>
          <a
            href={TELEGRAM_SUBSALE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-copper"
          >
            <Send className="h-4 w-4" aria-hidden />
            Telegram: Subsale &amp; Land
          </a>
          <a
            href={`tel:${AGENCY_PHONE.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 hover:text-copper"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {AGENCY_PHONE}
          </a>
          <a href={`mailto:${AGENCY_EMAIL}`} className="inline-flex items-center gap-1.5 hover:text-copper">
            <Mail className="h-4 w-4" aria-hidden />
            {AGENCY_EMAIL}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
